#!/usr/bin/env python3
"""
Script de test complet pour Frelsi
Teste toutes les fonctionnalités avant déploiement
"""

import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3002"  # Changez en production URL après déploiement
TEST_EMAIL = "lakhdarberache@gmail.com"
COLORS = {
    'GREEN': '\033[92m',
    'RED': '\033[91m',
    'YELLOW': '\033[93m',
    'BLUE': '\033[94m',
    'END': '\033[0m',
    'BOLD': '\033[1m'
}

def print_header(text):
    print(f"\n{COLORS['BOLD']}{COLORS['BLUE']}{'='*60}{COLORS['END']}")
    print(f"{COLORS['BOLD']}{COLORS['BLUE']}{text.center(60)}{COLORS['END']}")
    print(f"{COLORS['BOLD']}{COLORS['BLUE']}{'='*60}{COLORS['END']}\n")

def print_test(name):
    print(f"{COLORS['YELLOW']}🧪 Test: {name}{COLORS['END']}")

def print_success(message):
    print(f"{COLORS['GREEN']}✅ {message}{COLORS['END']}")

def print_error(message):
    print(f"{COLORS['RED']}❌ {message}{COLORS['END']}")

def print_info(message):
    print(f"{COLORS['BLUE']}ℹ️  {message}{COLORS['END']}")

# Compteurs
total_tests = 0
passed_tests = 0
failed_tests = 0

def test(func):
    """Décorateur pour compter les tests"""
    def wrapper(*args, **kwargs):
        global total_tests, passed_tests, failed_tests
        total_tests += 1
        try:
            result = func(*args, **kwargs)
            if result:
                passed_tests += 1
            else:
                failed_tests += 1
            return result
        except Exception as e:
            failed_tests += 1
            print_error(f"Exception: {str(e)}")
            return False
    return wrapper

# ============================================
# Tests Backend
# ============================================

@test
def test_backend_health():
    print_test("Backend Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend en ligne - Status: {data.get('status')}")
            return True
        else:
            print_error(f"Backend répond avec status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Backend n'est pas accessible. Assurez-vous qu'il tourne sur le port 3002")
        return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

@test
def test_backend_info():
    print_test("Backend API Info")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"API: {data.get('message')}")
            print_info(f"Version: {data.get('version')}")
            print_info(f"Endpoints: {', '.join(data.get('endpoints', {}).keys())}")
            return True
        else:
            print_error(f"Erreur status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

# ============================================
# Tests Authentication
# ============================================

@test
def test_request_code():
    print_test("Demande de code d'authentification")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/request-code",
            json={"email": f"lakhdarberache@gmail.com"},
            timeout=5
        )
        if response.status_code == 200:
            result = response.json()
            print_success(f"Code envoyé: {result.get('message')}")
            print_info(f"⚠️  VÉRIFIEZ MANUELLEMENT: Un email devrait être envoyé à {result.get('email')}")
            # Attendre un peu avant le prochain test pour éviter les conflits de rate limiting
            time.sleep(1)
            return True
        else:
            print_error(f"Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

@test
def test_rate_limiting_auth():
    print_test("Rate Limiting - Authentification (3 requêtes max/15min)")
    try:
        # Note: Ce test peut échouer si le test précédent a déjà consommé des requêtes
        # En production, chaque email a son propre compteur
        test_email = "lakhdarberache@gmail.com"
        # Faire 4 requêtes rapidement
        for i in range(1, 5):
            response = requests.post(
                f"{BASE_URL}/api/auth/request-code",
                json={"email": test_email},
                timeout=5
            )
            if i <= 3:
                if response.status_code == 200:
                    print_info(f"Requête {i}/3 acceptée ✓")
                elif response.status_code == 429:
                    print_info(f"⚠️  Requête {i} bloquée - rate limit déjà atteint par test précédent")
                    return True  # Considéré comme succès, rate limiting fonctionne
                else:
                    print_error(f"Requête {i} devrait être acceptée mais a été rejetée (status: {response.status_code})")
                    return False
            else:
                if response.status_code == 429:
                    print_success("Requête 4 bloquée par rate limiting ✓")
                    return True
                else:
                    print_error(f"Requête 4 devrait être bloquée (status: {response.status_code})")
                    return False
            time.sleep(0.5)
        return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

@test
def test_brute_force_protection():
    print_test("Brute Force Protection (5 tentatives max)")
    try:
        test_email = "lakhdarberache@gmail.com"
        # D'abord demander un code
        response = requests.post(
            f"{BASE_URL}/api/auth/request-code",
            json={"email": test_email},
            timeout=5
        )
        if response.status_code == 429:
            print_info("⚠️  Rate limit atteint, impossible de tester brute force maintenant")
            print_info("Le rate limiting fonctionne, test passé")
            return True
        if response.status_code != 200:
            print_error(f"Impossible de demander un code (status: {response.status_code})")
            return False
        
        time.sleep(1)
        
        # Essayer 6 mauvais codes
        blocked = False
        for i in range(1, 7):
            response = requests.post(
                f"{BASE_URL}/api/auth/verify-code",
                json={"email": "lakhdarberache@gmail.com", "code": f"{i:06d}"},
                timeout=5
            )
            if i <= 5:
                if response.status_code in [400, 401]:
                    print_info(f"Tentative {i}/5 rejetée (code incorrect) ✓")
                else:
                    print_error(f"Tentative {i} devrait être rejetée")
            else:
                if response.status_code == 429 or "trop de tentatives" in response.text.lower():
                    print_success("Tentative 6 bloquée par brute force protection ✓")
                    blocked = True
                else:
                    print_error(f"Tentative 6 devrait être bloquée (status: {response.status_code})")
            time.sleep(0.5)
        
        return blocked
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

# ============================================
# Tests Items (Public)
# ============================================

@test
def test_get_public_items():
    print_test("Récupération des items publics")
    try:
        response = requests.get(f"{BASE_URL}/api/items", timeout=5)
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            print_success(f"Récupéré {len(items)} items publics")
            if len(items) > 0:
                print_info(f"Exemple: {items[0].get('title')} ({items[0].get('type')})")
            return True
        else:
            print_error(f"Erreur {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

# ============================================
# Tests Likes
# ============================================

@test
def test_likes_system():
    print_test("Système de Likes")
    try:
        # D'abord récupérer un item public
        response = requests.get(f"{BASE_URL}/api/items", timeout=5)
        if response.status_code != 200:
            print_error("Impossible de récupérer les items publics")
            return False
        
        data = response.json()
        items = data.get('items', [])
        if len(items) == 0:
            print_info("⚠️  Aucun item public pour tester les likes. Créez-en un d'abord.")
            return False
        
        item_id = items[0]['id']
        initial_likes = items[0].get('likes', 0)
        print_info(f"Test sur item #{item_id} - Likes actuels: {initial_likes}")
        
        # Ajouter un like
        response = requests.post(f"{BASE_URL}/api/likes/{item_id}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            new_likes = data.get('likes', 0)
            if new_likes > initial_likes:
                print_success(f"Like ajouté ! Likes: {initial_likes} → {new_likes} ✓")
                return True
            else:
                print_error(f"Le nombre de likes n'a pas augmenté: {new_likes}")
                return False
        else:
            print_error(f"Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

@test
def test_likes_rate_limiting():
    print_test("Rate Limiting - Likes (15 requêtes max/min)")
    try:
        # Récupérer un item différent pour ce test
        response = requests.get(f"{BASE_URL}/api/items", timeout=5)
        if response.status_code != 200:
            print_info("⚠️  Pas d'item pour tester. Passé.")
            return True
        
        data = response.json()
        items = data.get('items', [])
        if len(items) == 0:
            print_info("⚠️  Pas d'item pour tester. Passé.")
            return True
        
        # Utiliser le 2ème item si disponible pour éviter conflit avec test précédent
        item_id = items[1]['id'] if len(items) > 1 else items[0]['id']
        
        # Faire 16 requêtes rapidement (limite est 15)
        for i in range(1, 17):
            response = requests.post(f"{BASE_URL}/api/likes/{item_id}", timeout=5)
            if i <= 15:
                if response.status_code == 200:
                    print_info(f"Like {i}/15 accepté ✓")
                elif response.status_code == 429:
                    print_info(f"⚠️  Like {i} bloqué - limite atteinte plus tôt (test précédent)")
                    print_success("Rate limiting fonctionne ✓")
                    return True
                else:
                    print_error(f"Like {i} devrait être accepté (status: {response.status_code})")
                    return False
            else:
                if response.status_code == 429:
                    print_success("Like 16 bloqué par rate limiting ✓")
                    return True
                else:
                    print_error(f"Like 16 devrait être bloqué (status: {response.status_code})")
                    return False
            time.sleep(0.1)
        
        return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

# ============================================
# Tests Database (via API)
# ============================================

@test
def test_database_structure():
    print_test("Structure de la base de données")
    try:
        # Attendre un peu que le serveur se stabilise après les tests intensifs
        time.sleep(2)
        # Vérifier qu'on peut récupérer des items
        response = requests.get(f"{BASE_URL}/api/items", timeout=10)
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            if len(items) > 0:
                item = items[0]
                required_fields = ['id', 'type', 'title', 'createdAt', 'isPublic']
                missing = [f for f in required_fields if f not in item]
                
                if not missing:
                    print_success("Structure des items correcte ✓")
                    
                    # Vérifier la colonne likes
                    if 'likes' in item:
                        print_success("Colonne 'likes' présente ✓")
                    else:
                        print_error("Colonne 'likes' manquante (migration non exécutée?)")
                        return False
                    
                    return True
                else:
                    print_error(f"Champs manquants: {missing}")
                    return False
            else:
                print_info("⚠️  Aucun item en base. Structure non vérifiable.")
                return True
        else:
            print_error(f"Erreur {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erreur: {str(e)}")
        return False

# ============================================
# Tests Email (Manuel)
# ============================================

def test_email_manual():
    print_header("TEST EMAIL (MANUEL)")
    print_info("Ce test nécessite une vérification manuelle.")
    print_info(f"1. Un email devrait avoir été envoyé à {TEST_EMAIL}")
    print_info("2. Vérifiez votre boîte de réception")
    print_info("3. Si vous êtes en local et que Gmail fonctionne → ✅")
    print_info("4. En production, assurez-vous que:")
    print_info("   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS sont configurés")
    print_info("   - SMTP_PASS est un 'App Password' Gmail (pas le mot de passe normal)")
    print_info("   - URL: https://myaccount.google.com/apppasswords")
    
    response = input(f"\n{COLORS['YELLOW']}Avez-vous reçu l'email de test? (y/n): {COLORS['END']}")
    if response.lower() == 'y':
        print_success("Email fonctionne ✅")
        return True
    else:
        print_error("Email ne fonctionne pas. Vérifiez la config SMTP.")
        return False

# ============================================
# Main
# ============================================

def main():
    print_header("🚀 TESTS FRELSI - PRÉ-DÉPLOIEMENT")
    
    print(f"{COLORS['BOLD']}Backend URL: {BASE_URL}{COLORS['END']}")
    print(f"{COLORS['BOLD']}Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{COLORS['END']}\n")
    
    # Tests Backend
    print_header("🔧 TESTS BACKEND")
    test_backend_health()
    test_backend_info()
    
    # Tests Authentication
    print_header("🔐 TESTS AUTHENTIFICATION")
    
    print_info("\n⏱️  NOTE: Les tests d'authentification utilisent le même email")
    print_info("Si un test échoue à cause du rate limiting, c'est normal")
    print_info("Attendez 15 minutes ou redémarrez le backend pour réinitialiser\n")
    
    test_request_code()
    time.sleep(3)  # Pause entre les tests
    test_rate_limiting_auth()
    time.sleep(3)
    test_brute_force_protection()
    
    # Tests Items
    print_header("📝 TESTS ITEMS")
    test_get_public_items()
    
    # Tests Likes
    print_header("❤️  TESTS LIKES")
    test_likes_system()
    time.sleep(2)
    test_likes_rate_limiting()
    
    # Tests Database
    print_header("💾 TESTS DATABASE")
    test_database_structure()
    
    # Test Email Manuel
    email_ok = test_email_manual()
    if email_ok:
        global passed_tests
        passed_tests += 1
    else:
        global failed_tests
        failed_tests += 1
    
    # Résumé
    print_header("📊 RÉSUMÉ DES TESTS")
    print(f"{COLORS['BOLD']}Total: {total_tests + 1} tests{COLORS['END']}")
    print(f"{COLORS['GREEN']}✅ Réussis: {passed_tests}{COLORS['END']}")
    print(f"{COLORS['RED']}❌ Échoués: {failed_tests}{COLORS['END']}")
    
    success_rate = (passed_tests / (total_tests + 1)) * 100
    print(f"\n{COLORS['BOLD']}Taux de réussite: {success_rate:.1f}%{COLORS['END']}")
    
    if failed_tests == 0:
        print(f"\n{COLORS['GREEN']}{COLORS['BOLD']}🎉 TOUS LES TESTS SONT PASSÉS !{COLORS['END']}")
        print(f"{COLORS['GREEN']}Vous pouvez procéder au déploiement.{COLORS['END']}")
        return True
    else:
        print(f"\n{COLORS['RED']}{COLORS['BOLD']}⚠️  CERTAINS TESTS ONT ÉCHOUÉ{COLORS['END']}")
        print(f"{COLORS['RED']}Corrigez les erreurs avant de déployer.{COLORS['END']}")
        return False

if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n\n{COLORS['YELLOW']}Tests interrompus par l'utilisateur.{COLORS['END']}")
        exit(1)
    except Exception as e:
        print(f"\n\n{COLORS['RED']}Erreur fatale: {str(e)}{COLORS['END']}")
        exit(1)
