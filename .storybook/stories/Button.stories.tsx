import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, IconButton } from "../../src/ui-react/components/Button";
import { AppIcon } from "../../src/ui-react/components/Icons";

const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "버튼",
    variant: "ghost",
    size: "md",
    disabled: false,
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};

export const Primary: Story = {
  args: {
    children: "게임 시작",
    variant: "primary",
  },
};

export const Danger: Story = {
  args: {
    children: "삭제",
    variant: "danger",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button size="sm">작게</Button>
      <Button size="md">기본</Button>
      <Button size="lg">크게</Button>
    </div>
  ),
};

export const Icon: Story = {
  render: () => (
    <IconButton ariaLabel="메일" title="메일">
      <AppIcon name="mail" size={16} />
    </IconButton>
  ),
};
