import type { Segment } from '../hooks/useSegments';

export interface Template {
  id: string;
  name: string;
  description: string;
  segments: Segment[];
}

function equal(items: Array<{ id: string; label: string; color: string }>): Segment[] {
  const pct = parseFloat((100 / items.length).toFixed(4));
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    weight: 1,
    percentage: pct,
    color: item.color,
  }));
}

export const TEMPLATES: Template[] = [
  {
    id: 'team-lunch',
    name: 'Team Lunch',
    description: 'Let the wheel decide where the team eats today.',
    segments: equal([
      { id: 'tl1', label: 'Pizza',   color: '#ff6b6b' },
      { id: 'tl2', label: 'Sushi',   color: '#4ecdc4' },
      { id: 'tl3', label: 'Tacos',   color: '#ffd93d' },
      { id: 'tl4', label: 'Burgers', color: '#ff922b' },
      { id: 'tl5', label: 'Salad',   color: '#51cf66' },
    ]),
  },
  {
    id: 'truth-or-dare',
    name: 'Truth or Dare',
    description: 'Classic 50/50 party game spinner.',
    segments: equal([
      { id: 'tod1', label: 'Truth', color: '#f43f5e' },
      { id: 'tod2', label: 'Dare',  color: '#6366f1' },
    ]),
  },
  {
    id: 'yes-no-maybe',
    name: 'Yes, No, Maybe',
    description: 'Quick three-way decision maker.',
    segments: equal([
      { id: 'ynm1', label: 'Yes',   color: '#22c55e' },
      { id: 'ynm2', label: 'No',    color: '#ef4444' },
      { id: 'ynm3', label: 'Maybe', color: '#eab308' },
    ]),
  },
  {
    id: 'daily-standup',
    name: 'Daily Standup Picker',
    description: 'Randomly select who speaks first in stand-up.',
    segments: equal([
      { id: 'ds1', label: 'Alice', color: '#a855f7' },
      { id: 'ds2', label: 'Bob',   color: '#3b82f6' },
      { id: 'ds3', label: 'Carol', color: '#ec4899' },
      { id: 'ds4', label: 'Dave',  color: '#14b8a6' },
    ]),
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    description: 'Pick a genre for tonight\'s film.',
    segments: equal([
      { id: 'mn1', label: 'Action',       color: '#ef4444' },
      { id: 'mn2', label: 'Comedy',       color: '#f59e0b' },
      { id: 'mn3', label: 'Horror',       color: '#7c3aed' },
      { id: 'mn4', label: 'Romance',      color: '#f472b6' },
      { id: 'mn5', label: 'Documentary',  color: '#06b6d4' },
    ]),
  },
  {
    id: 'chore-wheel',
    name: 'Chore Wheel',
    description: 'Fair chore assignment for the household.',
    segments: equal([
      { id: 'cw1', label: 'Dishes',     color: '#60a5fa' },
      { id: 'cw2', label: 'Laundry',    color: '#34d399' },
      { id: 'cw3', label: 'Vacuuming',  color: '#fbbf24' },
      { id: 'cw4', label: 'Trash',      color: '#f87171' },
      { id: 'cw5', label: 'Cooking',    color: '#c084fc' },
    ]),
  },
  {
    id: 'workout-roulette',
    name: 'Workout Roulette',
    description: 'Surprise yourself with a random exercise.',
    segments: equal([
      { id: 'wr1', label: 'Push-ups', color: '#f97316' },
      { id: 'wr2', label: 'Squats',   color: '#84cc16' },
      { id: 'wr3', label: 'Burpees',  color: '#ef4444' },
      { id: 'wr4', label: 'Plank',    color: '#06b6d4' },
      { id: 'wr5', label: 'Run',      color: '#a78bfa' },
    ]),
  },
  {
    id: 'study-break',
    name: 'Study Break',
    description: 'Decide how to recharge between sessions.',
    segments: equal([
      { id: 'sb1', label: 'Walk',         color: '#4ade80' },
      { id: 'sb2', label: 'Snack',        color: '#fb923c' },
      { id: 'sb3', label: 'Stretch',      color: '#38bdf8' },
      { id: 'sb4', label: 'Nap',          color: '#a78bfa' },
      { id: 'sb5', label: 'Social Media', color: '#f472b6' },
    ]),
  },
  {
    id: 'weekend-activity',
    name: 'Weekend Activity',
    description: 'No more "what should we do?" debates.',
    segments: equal([
      { id: 'wa1', label: 'Hiking',       color: '#4ade80' },
      { id: 'wa2', label: 'Movie',        color: '#60a5fa' },
      { id: 'wa3', label: 'Board Games',  color: '#f59e0b' },
      { id: 'wa4', label: 'Cook',         color: '#f87171' },
      { id: 'wa5', label: 'Read',         color: '#c084fc' },
    ]),
  },
  {
    id: 'icebreaker',
    name: 'Icebreaker',
    description: 'Kick off meetings with a fun ice-breaker.',
    segments: equal([
      { id: 'ib1', label: 'Joke',     color: '#fbbf24' },
      { id: 'ib2', label: 'Fact',     color: '#34d399' },
      { id: 'ib3', label: 'Question', color: '#60a5fa' },
      { id: 'ib4', label: 'Story',    color: '#f472b6' },
      { id: 'ib5', label: 'Song',     color: '#a78bfa' },
    ]),
  },
];
