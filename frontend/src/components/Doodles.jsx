import React from 'react'

export default function Doodles(){
  return (
    <>
      {/* Left side creative doodles */}
      <svg className="doodle doodle-left doodle-1" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Flowing organic line */}
        <path d="M40 50 Q 80 80, 60 120 T 40 180 Q 20 220, 60 260 T 40 320" stroke="#deb7a6" strokeWidth="4" fill="none" strokeLinecap="round"/>
        {/* Abstract shapes */}
        <circle cx="70" cy="100" r="8" fill="#b57b6b" opacity="0.7"/>
        <circle cx="50" cy="240" r="12" fill="#caa291" opacity="0.5"/>
        <rect x="30" y="160" width="15" height="15" fill="#e4c5b9" opacity="0.6" transform="rotate(45 37.5 167.5)"/>
        {/* Dots cluster */}
        <circle cx="85" cy="200" r="3" fill="#b57b6b"/>
        <circle cx="95" cy="205" r="3" fill="#b57b6b"/>
        <circle cx="90" cy="215" r="3" fill="#b57b6b"/>
        {/* Curved accent */}
        <path d="M20 300 Q 50 290, 45 310" stroke="#c18a75" strokeWidth="3" fill="none"/>
      </svg>

      {/* Top right artistic doodle */}
      <svg className="doodle doodle-right doodle-2" viewBox="0 0 250 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Spiral-like path */}
        <path d="M120 20 Q 160 40, 140 80 Q 100 100, 120 140 Q 150 170, 120 200" stroke="#c18a75" strokeWidth="4" fill="none" strokeLinecap="round"/>
        {/* Geometric accents */}
        <polygon points="180,60 190,75 180,90 170,75" fill="#deb7a6" opacity="0.7"/>
        <circle cx="200" cy="130" r="10" fill="#b57b6b" opacity="0.6"/>
        {/* Stars */}
        <path d="M160 180 l3 9 l9 1 l-7 6 l2 9 l-7-5 l-7 5 l2-9 l-7-6 l9-1 z" fill="#e4c5b9" opacity="0.8"/>
        {/* Wavy line */}
        <path d="M140 240 Q 160 230, 180 240 T 220 240" stroke="#caa291" strokeWidth="3" fill="none"/>
      </svg>

      {/* Bottom left playful doodle */}
      <svg className="doodle doodle-left doodle-3" viewBox="0 0 180 350" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Organic blob shape */}
        <path d="M50 50 Q 90 30, 110 60 Q 120 100, 90 120 Q 50 130, 40 100 Q 20 70, 50 50 Z" fill="#e4c5b9" opacity="0.4"/>
        {/* Connecting curves */}
        <path d="M70 150 Q 100 140, 90 170 Q 80 200, 110 210" stroke="#b57b6b" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
        {/* Abstract eye-like shape */}
        <ellipse cx="65" cy="250" rx="20" ry="12" fill="none" stroke="#caa291" strokeWidth="2"/>
        <circle cx="65" cy="250" r="4" fill="#b57b6b"/>
        {/* Small accents */}
        <line x1="30" y1="300" x2="50" y2="310" stroke="#deb7a6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="40" y1="320" x2="60" y2="315" stroke="#c18a75" strokeWidth="3" strokeLinecap="round"/>
      </svg>

      {/* Bottom right modern doodle */}
      <svg className="doodle doodle-right doodle-4" viewBox="0 0 220 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Abstract face concept */}
        <circle cx="110" cy="80" r="35" fill="none" stroke="#deb7a6" strokeWidth="3"/>
        <circle cx="100" cy="75" r="4" fill="#b57b6b"/>
        <circle cx="120" cy="75" r="4" fill="#b57b6b"/>
        <path d="M100 90 Q 110 95, 120 90" stroke="#b57b6b" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Flowing energy lines */}
        <path d="M150 150 Q 180 160, 170 190 Q 160 220, 185 240" stroke="#c18a75" strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M140 180 Q 160 185, 155 205" stroke="#caa291" strokeWidth="2" fill="none"/>
        {/* Decorative elements */}
        <circle cx="190" cy="280" r="6" fill="#e4c5b9" opacity="0.8"/>
        <circle cx="175" cy="300" r="4" fill="#deb7a6" opacity="0.7"/>
        <circle cx="195" cy="310" r="5" fill="#b57b6b" opacity="0.6"/>
        {/* Arrow-like accent */}
        <path d="M160 340 L170 350 L160 360" stroke="#c18a75" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* Doodle 5 - Playful stars */}
      <svg className="doodle doodle-5" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M60 10 l8 25 l26 2 l-20 18 l6 26 l-20-14 l-20 14 l6-26 l-20-18 l26-2 z" fill="#e4c5b9" opacity="0.6"/>
        <circle cx="30" cy="90" r="5" fill="#deb7a6" opacity="0.7"/>
        <circle cx="90" cy="30" r="4" fill="#caa291" opacity="0.6"/>
      </svg>

      {/* Doodle 6 - Geometric patterns */}
      <svg className="doodle doodle-6" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="30" y="30" width="80" height="80" fill="none" stroke="#b57b6b" strokeWidth="3" rx="10"/>
        <circle cx="70" cy="70" r="20" fill="#e4c5b9" opacity="0.5"/>
        <path d="M50 50 L90 90 M90 50 L50 90" stroke="#deb7a6" strokeWidth="2" opacity="0.7"/>
      </svg>

      {/* Doodle 7 - Flowing ribbons */}
      <svg className="doodle doodle-7" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 80 Q 40 40, 80 60 T 140 80 Q 120 120, 80 100 T 20 80" stroke="#c18a75" strokeWidth="4" fill="none" opacity="0.7"/>
        <circle cx="50" cy="60" r="6" fill="#deb7a6" opacity="0.6"/>
        <circle cx="110" cy="100" r="6" fill="#caa291" opacity="0.6"/>
      </svg>

      {/* Doodle 8 - Abstract nature */}
      <svg className="doodle doodle-8" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M65 20 Q 50 40, 65 60 Q 80 80, 65 100" stroke="#b57b6b" strokeWidth="3" fill="none"/>
        <circle cx="40" cy="50" r="8" fill="#e4c5b9" opacity="0.6"/>
        <circle cx="90" cy="80" r="8" fill="#deb7a6" opacity="0.6"/>
        <path d="M30 90 Q 65 85, 100 90" stroke="#caa291" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
      </svg>
    </>
  )
}
