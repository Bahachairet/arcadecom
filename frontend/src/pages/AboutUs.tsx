import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Zap, Globe } from 'lucide-react';

const team = [
  { name: 'Alex Chen', role: 'Founder & CEO', initials: 'AC', tint: 'bg-tint-salmon' },
  { name: 'Sarah Kim', role: 'Head of Product', initials: 'SK', tint: 'bg-tint-sky' },
  { name: 'Marcus Wright', role: 'Lead Engineer', initials: 'MW', tint: 'bg-tint-lime' },
  { name: 'Priya Patel', role: 'Design Director', initials: 'PP', tint: 'bg-tint-peach' },
];

const values = [
  { icon: Shield, title: 'Trust & Authenticity', description: 'Every item is verified. Every transaction is secure. We built VaultX on the promise that collectors deserve better.', tint: 'bg-tint-salmon' },
  { icon: Users, title: 'Community First', description: 'VaultX exists because of the people who use it. We listen, we iterate, we build for the culture.', tint: 'bg-tint-sky' },
  { icon: Zap, title: 'Speed & Simplicity', description: 'No clutter. No confusion. Find what you want, bid on it, own it. That simple.', tint: 'bg-tint-lime' },
  { icon: Globe, title: 'Global Reach', description: 'From Tokyo to Toronto, collectors connect through VaultX. Rare knows no borders.', tint: 'bg-tint-peach' },
];

const milestones = [
  { id: '1', year: '2024', event: 'VaultX Founded', description: 'Started with a simple idea: collectors deserve better.', tint: 'bg-tint-salmon' },
  { id: '2', year: '2024', event: 'First 1,000 Users', description: 'Community grew organically through word of mouth.', tint: 'bg-tint-sky' },
  { id: '3', year: '2025', event: '$1M Volume', description: 'Hit one million dollars in total trades.', tint: 'bg-tint-lime' },
  { id: '4', year: '2025', event: '25K Collectors', description: 'Now one of the fastest growing collector platforms.', tint: 'bg-tint-peach' },
];

export default function AboutUs() {
  return (
    <div className="px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-link hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      {/* Hero Section Eyebrow */}
      <div className="bg-tint-olive border-2 border-ink border-b-0 px-6 py-24">
        <h1 className="font-display text-6xl font-bold uppercase mb-4 max-w-4xl">
          We Built The Marketplace We Wanted To Use
        </h1>
        <p className="text-lg max-w-2xl leading-relaxed">
          VaultX was born from frustration. Collectors deserved better than scattered forums, 
          sketchy middlemen, and fake goods. So we built the platform we wished existed.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-ink">
        <div className="bg-tint-salmon border-r-2 border-ink px-6 py-8 text-center">
          <p className="font-heading text-4xl font-bold">25K+</p>
          <p className="text-xs font-bold uppercase mt-1">Collectors</p>
        </div>
        <div className="bg-tint-sky border-r-2 border-ink px-6 py-8 text-center">
          <p className="font-heading text-4xl font-bold">$2.1M</p>
          <p className="text-xs font-bold uppercase mt-1">Volume Traded</p>
        </div>
        <div className="bg-tint-lime border-r-2 border-ink px-6 py-8 text-center">
          <p className="font-heading text-4xl font-bold">8,500+</p>
          <p className="text-xs font-bold uppercase mt-1">Items Listed</p>
        </div>
        <div className="bg-tint-peach px-6 py-8 text-center">
          <p className="font-heading text-4xl font-bold">99.8%</p>
          <p className="text-xs font-bold uppercase mt-1">Positive Feedback</p>
        </div>
      </div>

      {/* Mission Section Eyebrow */}
      <div className="mt-12">
        <div className="bg-tint-sky border-2 border-ink border-b-0 px-6 py-4">
          <span className="font-display text-2xl font-bold uppercase">Our Mission</span>
        </div>
        <div className="bg-canvas border-2 border-ink px-6 py-8">
          <p className="text-lg leading-relaxed max-w-3xl">
            <span className="font-heading font-bold uppercase">To make rare accessible.</span> Whether it's a vintage sneaker, a limited art print, or a one-of-a-kind collectible — 
            VaultX connects the people who cherish these items with the people who want them. 
            No gatekeepers. No guesswork. Just authentic culture, traded honestly.
          </p>
        </div>
      </div>

      {/* Values Section Eyebrow */}
      <div className="mt-12">
        <div className="bg-tint-salmon border-2 border-ink border-b-0 px-6 py-4">
          <span className="font-display text-2xl font-bold uppercase">What We Stand For</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-ink">
          {values.map((v, i) => (
            <div key={v.title} className={`${i < 2 ? 'border-b-2 border-ink' : ''} ${i % 2 === 0 ? 'md:border-r-2 border-ink' : ''}`}>
              <div className={`${v.tint} px-6 py-3 border-b-2 border-ink`}>
                <div className="flex items-center gap-3">
                  <v.icon className="h-5 w-5" />
                  <h3 className="font-heading font-bold uppercase">{v.title}</h3>
                </div>
              </div>
              <div className="bg-canvas px-6 py-4">
                <p className="text-sm leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section Eyebrow */}
      <div className="mt-12">
        <div className="bg-tint-lime border-2 border-ink border-b-0 px-6 py-4">
          <span className="font-display text-2xl font-bold uppercase">Our Journey</span>
        </div>
        <div className="border-2 border-ink">
          {milestones.map((m, i) => (
            <div key={m.id} className={`${i < milestones.length - 1 ? 'border-b-2 border-ink' : ''}`}>
              <div className={`${m.tint} px-6 py-3 border-b-2 border-ink`}>
                <span className="font-heading font-bold text-sm">{m.year}</span>
              </div>
              <div className="bg-canvas px-6 py-4">
                <h4 className="font-heading font-bold uppercase text-sm mb-1">{m.event}</h4>
                <p className="text-sm">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section Eyebrow */}
      <div className="mt-12">
        <div className="bg-tint-periwinkle border-2 border-ink border-b-0 px-6 py-4">
          <span className="font-display text-2xl font-bold uppercase">The Team</span>
        </div>
        <div className="bg-canvas border-2 border-ink px-6 py-8">
          <p className="mb-6 max-w-2xl">
            We're collectors, builders, and obsessive perfectionists. Every feature on VaultX 
            is something we'd want to use ourselves.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {team.map((member) => (
              <div key={member.name} className="border-2 border-ink">
                <div className={`${member.tint} px-4 py-3 border-b-2 border-ink`}>
                  <div className="w-16 h-16 bg-ink text-canvas flex items-center justify-center font-heading font-bold text-lg">
                    {member.initials}
                  </div>
                </div>
                <div className="bg-canvas px-4 py-3">
                  <h4 className="font-heading font-bold uppercase text-sm">{member.name}</h4>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section Eyebrow */}
      <div className="mt-12">
        <div className="bg-tint-olive border-2 border-ink border-b-0 px-6 py-4">
          <span className="font-display text-2xl font-bold uppercase">Join Us</span>
        </div>
        <div className="bg-canvas border-2 border-ink px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold uppercase text-lg mb-1">Ready to start collecting?</h3>
            <p className="text-sm">Join 25,000+ collectors who trust VaultX.</p>
          </div>
          <Link
            to="/register"
            className="inline-block border-2 border-ink bg-ink text-canvas px-8 py-3 font-bold uppercase text-sm hover:bg-ink/90 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
