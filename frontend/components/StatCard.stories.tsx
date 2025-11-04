import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern statistics card component with icons, trends, and animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Card title',
    },
    value: {
      control: { type: 'text' },
      description: 'Main value to display',
    },
    color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'purple', 'orange'],
      description: 'Color theme for the card',
    },
    trend: {
      control: { type: 'object' },
      description: 'Trend information with value and direction',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const UserIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const CheckIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CreditIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

export const TotalReferred: Story = {
  args: {
    title: 'Total Referred',
    value: 24,
    icon: UserIcon,
    color: 'blue',
    trend: { value: 12, isPositive: true },
  },
};

export const Converted: Story = {
  args: {
    title: 'Converted',
    value: 18,
    icon: CheckIcon,
    color: 'green',
    trend: { value: 8, isPositive: true },
  },
};

export const TotalCredits: Story = {
  args: {
    title: 'Total Credits',
    value: 156,
    icon: CreditIcon,
    color: 'purple',
    trend: { value: 25, isPositive: true },
  },
};

export const NegativeTrend: Story = {
  args: {
    title: 'Monthly Revenue',
    value: '$2,340',
    icon: CreditIcon,
    color: 'orange',
    trend: { value: 5, isPositive: false },
  },
};

export const WithoutTrend: Story = {
  args: {
    title: 'Active Users',
    value: 1205,
    icon: UserIcon,
    color: 'blue',
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Simple Stat',
    value: 42,
    color: 'green',
    trend: { value: 15, isPositive: true },
  },
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <StatCard
        title="Total Referred"
        value={24}
        icon={UserIcon}
        color="blue"
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Converted"
        value={18}
        icon={CheckIcon}
        color="green"
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Total Credits"
        value={156}
        icon={CreditIcon}
        color="purple"
        trend={{ value: 25, isPositive: true }}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of multiple stat cards in a dashboard layout.',
      },
    },
  },
};