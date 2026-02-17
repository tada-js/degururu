import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppIcon, ICON_REGISTRY, type AppIconName } from "../../src/ui-react/components/Icons";

const meta = {
  title: "Design System/Icon",
  component: AppIcon,
  tags: ["autodocs"],
  args: {
    name: "mail",
    size: 20,
  },
} satisfies Meta<typeof AppIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 12,
        width: 520,
      }}
    >
      {(Object.keys(ICON_REGISTRY) as AppIconName[]).map((name) => {
        const icon = ICON_REGISTRY[name];
        return (
          <div
            key={name}
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 10,
              padding: 10,
              display: "grid",
              gap: 8,
              justifyItems: "center",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <AppIcon name={name} size={20} />
            <div style={{ fontSize: 11, color: "rgba(230,236,244,0.86)" }}>{icon.label}</div>
            <code style={{ fontSize: 10, color: "rgba(197,214,236,0.9)" }}>{name}</code>
          </div>
        );
      })}
    </div>
  ),
};
