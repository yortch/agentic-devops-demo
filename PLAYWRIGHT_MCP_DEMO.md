# Playwright MCP Demo Script

This demo script showcases how to use **Playwright MCP (Model Context Protocol)** with GitHub Copilot to interact with web applications through natural language commands.

## Prerequisites

Before starting the demo, ensure:

1. **Backend is running**: 
   ```bash
   cd backend && mvn spring-boot:run
   ```
   Backend runs on `http://localhost:8080`

2. **Frontend is running**:
   ```bash
   cd frontend && npm run dev
   ```
   Frontend runs on `http://localhost:5174`

3. **Playwright MCP is configured** in VS Code with GitHub Copilot

---

## Demo Scenarios

### 🎬 Scenario 1: Basic Navigation & Page Inspection

**Goal**: Demonstrate how Copilot can navigate to a website and inspect the page structure.

**Prompts to use**:

1. **Navigate to the app**:
   > "Navigate to http://localhost:5174"

2. **Take a snapshot**:
   > "Take an accessibility snapshot of the page"

3. **Describe the page**:
   > "What elements are visible on this page?"

---

### 🎬 Scenario 2: Interactive Element Discovery

**Goal**: Show how Copilot can identify and interact with UI elements.

**Prompts to use**:

1. **Find buttons**:
   > "What buttons are available on the page?"

2. **Click a button**:
   > "Click the 'Compare Cards' button"

3. **Verify navigation**:
   > "Take a snapshot to see where we are now"

---

### 🎬 Scenario 3: Form Interactions & Filtering

**Goal**: Demonstrate filtering functionality on the Card Comparison page.

**Prompts to use**:

1. **Navigate to comparison page**:
   > "Navigate to http://localhost:5173/cards"

2. **Take snapshot**:
   > "Take an accessibility snapshot"

3. **Interact with filters**:
   > "Click on the annual fee filter and select 'No Annual Fee'"

4. **Verify results**:
   > "Take a snapshot to see the filtered results"

---

### 🎬 Scenario 4: Card Details Exploration

**Goal**: Show navigation to card details and extracting information.

**Prompts to use**:

1. **Click on a card**:
   > "Click on 'View Details' for the first credit card"

2. **Extract information**:
   > "Take a snapshot and tell me what information is shown about this card"

3. **Check for specific sections**:
   > "What fees are listed for this card?"

---

### 🎬 Scenario 5: Responsive Design Testing

**Goal**: Demonstrate viewport resizing for responsive design testing.

**Prompts to use**:

1. **Resize to tablet**:
   > "Resize the browser to 768x1024 for tablet view"

2. **Take snapshot**:
   > "Take a snapshot to see the tablet layout"

3. **Resize to mobile**:
   > "Resize the browser to 375x667 for mobile view"

4. **Compare layouts**:
   > "Take a snapshot of the mobile layout"

---

### 🎬 Scenario 6: Screenshot Capture

**Goal**: Show visual documentation capabilities.

**Prompts to use**:

1. **Navigate to home**:
   > "Navigate to http://localhost:5173"

2. **Full page screenshot**:
   > "Take a screenshot of the page"

3. **Navigate and capture**:
   > "Navigate to the cards page and take a screenshot"

---

### 🎬 Scenario 7: Testing User Flows

**Goal**: Demonstrate end-to-end user journey testing.

**Prompts to use**:

1. **Start fresh**:
   > "Navigate to http://localhost:5173"

2. **Complete a user flow**:
   > "Click 'Compare Cards', then click on the first card's 'View Details' button"

3. **Verify the journey**:
   > "Take a snapshot and confirm we're on a card details page"

---

### 🎬 Scenario 8: Console & Network Monitoring

**Goal**: Show debugging capabilities.

**Prompts to use**:

1. **Check console**:
   > "Show me any console messages from the page"

2. **Check network**:
   > "Show me the network requests made by the page"

3. **Look for errors**:
   > "Are there any console errors on the page?"

---

### 🎬 Scenario 9: Keyboard Navigation Testing

**Goal**: Demonstrate accessibility testing through keyboard navigation.

**Prompts to use**:

1. **Navigate to page**:
   > "Navigate to http://localhost:5173"

2. **Use keyboard**:
   > "Press Tab to move to the next focusable element"

3. **Continue navigation**:
   > "Press Tab 3 more times and take a snapshot"

4. **Activate element**:
   > "Press Enter to activate the focused element"

---

### 🎬 Scenario 10: Complex Interaction Sequence

**Goal**: Show a complete testing scenario combining multiple actions.

**Prompts to use**:

1. **Full workflow**:
   > "Navigate to http://localhost:5173, click 'Compare Cards', resize to mobile view (375x667), and take a screenshot"

2. **Verify and report**:
   > "Take an accessibility snapshot and describe the layout"

---

## Demo Tips

### 🎯 Best Practices for the Demo

1. **Start simple**: Begin with navigation and snapshots before complex interactions
2. **Show the accessibility snapshot**: This is more informative than screenshots for understanding page structure
3. **Highlight natural language**: Emphasize that commands are in plain English
4. **Show error handling**: Demonstrate what happens when an element isn't found
5. **Compare to traditional testing**: Reference the existing Playwright tests in `/tests/e2e/`

### 💡 Talking Points

- **No code required**: Interact with web apps using natural language
- **Accessibility-first**: Uses accessibility tree for reliable element selection
- **Real browser**: Actually running in a real browser instance
- **Debugging support**: Access to console logs and network requests
- **Visual verification**: Screenshots and snapshots for documentation

### ⚠️ Common Issues

1. **Browser not installed**: If Playwright browser isn't installed, use:
   > "Install the browser"

2. **Page not loading**: Ensure both backend and frontend servers are running

3. **Element not found**: Use accessibility snapshot to find the correct element reference

---

## Sample Demo Script (5 minutes)

```
1. [0:00] "Let me show you Playwright MCP - using natural language to test web apps"

2. [0:30] "Navigate to http://localhost:5173"
   - Show the page loading

3. [1:00] "Take an accessibility snapshot"
   - Explain the structure shown

4. [1:30] "Click the Compare Cards button"
   - Show the navigation happening

5. [2:00] "Take a snapshot - what cards are displayed?"
   - Show Copilot analyzing the page

6. [2:30] "Resize to mobile view at 375x667"
   - Demonstrate responsive testing

7. [3:00] "Take a screenshot"
   - Show visual capture

8. [3:30] "Click View Details on the first card"
   - Navigate to details page

9. [4:00] "What information is shown about this card?"
   - Show intelligent page analysis

10. [4:30] "Check for any console errors"
    - Demonstrate debugging capabilities

11. [5:00] Summary and Q&A
```

---

## Related Files

- **Existing Playwright Tests**: `tests/e2e/`
- **Playwright Config**: `tests/playwright.config.js`
- **Test Fixtures**: `tests/fixtures/credit-cards.json`

---

## Quick Reference - Playwright MCP Tools

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_snapshot` | Get accessibility snapshot |
| `browser_screenshot` | Capture visual screenshot |
| `browser_click` | Click on an element |
| `browser_type` | Type text into an input |
| `browser_press_key` | Press keyboard keys |
| `browser_resize` | Resize browser viewport |
| `browser_console_messages` | Get console output |
| `browser_network_requests` | Get network activity |
| `browser_close` | Close the browser |

---

*Created for Three Rivers Bank Credit Card Website Demo*
