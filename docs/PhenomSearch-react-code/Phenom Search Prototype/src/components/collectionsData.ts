import { Star, Fingerprint, Plane, Circle, Triangle, Shield, FileText, Users } from 'lucide-react';

export const collections = [
  {
    id: 'high-credibility',
    title: 'High Credibility',
    icon: Star,
    description: 'Verified sightings with credibility score ≥10 and high strangeness',
    count: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1729722615809-45b3f2ad1747?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHNreSUyMHN0YXJzJTIwdGVsZXNjb3BlfGVufDF8fHx8MTc2NDA4MDMxMnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'military',
    title: 'Military Witnesses',
    icon: Shield,
    description: 'Encounters reported by military personnel (MIL, HQO)',
    count: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1605912290482-73b95b8ba855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMGJhc2UlMjByYWRhcnxlbnwxfHx8fDE3NjQwODAzMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'physical-traces',
    title: 'Physical Traces',
    icon: Fingerprint,
    description: 'Cases with documented material evidence (TRC, DRT, VEG, LND)',
    count: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1599318142003-2570ff9dda6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JlbnNpYyUyMGxhYm9yYXRvcnklMjBldmlkZW5jZXxlbnwxfHx8fDE3NjQwODAzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'historical',
    title: 'Historical Cases',
    icon: Plane,
    description: 'Significant events before 1950, including early observations',
    count: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1711037494288-c56ffd446f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWdodGVyJTIwamV0JTIwY29ja3BpdHxlbnwxfHx8fDE3NjQwMTM2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'unexplainable',
    title: 'Unexplainable',
    icon: Users,
    description: 'Most mysterious cases with strangeness ≥8',
    count: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080',
  },
  {
    id: 'photographic',
    title: 'Photographic Evidence',
    icon: FileText,
    description: 'Cases with photographic documentation (PHT)',
    count: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080',
  },
];
