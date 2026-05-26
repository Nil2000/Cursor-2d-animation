import type { Metadata } from 'next';
import Client from './_component/client';

export const metadata: Metadata = {
  title: 'Manim AI - AI-powered 2D animation studio',
  description:
    'Create polished Manim-style 2D animations from prompts with AI planning, code generation, and render-ready workflows.',
};

export default function Home() {
  return <Client />;
}
