# 如何製作手風琴 accordion 2【 我不會寫 React Component 】

## Spec: space / enter to expands

```tsx
describe("when focus is on the accordion header of a collapsed section, expands the section", () => {
  it("enter", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item open={false}>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.queryByText("test content")).not.toBeInTheDocument();
    screen.getByRole("button", { name: "Personal Information" }).focus();
    await user.keyboard("{enter}");
    expect(screen.queryByText("test content")).toBeInTheDocument();
  });

  it("space", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item open={false}>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.queryByText("test content")).not.toBeInTheDocument();
    screen.getByRole("button", { name: "Personal Information" }).focus();
    await user.keyboard("{Space}");
    expect(screen.queryByText("test content")).toBeInTheDocument();
  });
});
```

### Solution

```tsx
function Item(props: ItemProps) {
  const [open, setOpen] = useState(props.open ?? true);
  const toggle = () => setOpen(!open);
  const _id = useId();
  const id = {
    controls: _id + "controls",
    labelledby: _id + "labelledby",
  };

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key === "Space") {
        toggle();
      }
    }
    window.addEventListener("keydown", keydown);
    return () => void window.removeEventListener("keydown", keydown);
  }, [toggle]);

  return (
    <Context.Provider value={{ open, toggle, id }}>
      {props.children}
    </Context.Provider>
  );
}
```
