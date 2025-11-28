# AI Coding Agent Instructions

## Project Overview

Frontend project with **GrowingIO SDK v4** integration and testing capabilities. Key components:
- `测试.html` - Main test page with SDK integration
- `js/gio-config.js` - SDK initialization and configuration
- `js/test.js` - Test helper class for SDK functionality testing
- `css/style.css` - Styling for test interface
- `test/` - Test directory (reserved for future automated tests)

## Architecture & Code Organization

### Directory Structure
```
.
├── .github/
│   └── copilot-instructions.md     # This file
├── js/
│   ├── gio-config.js               # GrowingIO SDK initialization
│   └── test.js                     # Test helper and event tracking
├── css/
│   └── style.css                   # UI styling
├── test/                           # Future automated tests
└── 测试.html                        # Main test HTML page
```

### Code Organization Principles
- **Separation of Concerns**: Configuration, testing logic, and styling are separate files
- **SDK Configuration**: `gio-config.js` handles all GrowingIO initialization settings
- **Test Helper Class**: `GIOTestHelper` in `test.js` encapsulates SDK testing functionality
- **No Build System**: Currently uses vanilla HTML/CSS/JS with CDN-hosted SDK

## Development Workflows

### Testing the SDK Integration

1. **Open the test page**: Open `测试.html` in a browser (locally or via HTTP server)
2. **Check SDK Status**: Page displays whether SDK loaded successfully
3. **Run Tests**:
   - **发送自定义事件** - Sends a test event with action, timestamp, and random value
   - **设置用户信息** - Sets user data (userId, name, email, signup_time, vip attributes)
   - **清除用户信息** - Clears all user data from current session

### Key Implementation Details

**SDK Initialization Flow** (`gio-config.js`):
- Calls `window.gio('init', {...})` with projectId and configuration
- Sets `debug: true` for development logging
- Enables `autotrack: true` for automatic page tracking
- Remember to replace `YOUR_PROJECT_ID` with actual project ID

**Event Tracking Pattern** (`test.js`):
```javascript
window.gio('track', eventName, eventProperties);
```
- Track custom events with arbitrary properties
- All events logged to in-page log display for visibility

**User Management Pattern**:
```javascript
window.gio('setUser', { userId: '...', attributes: {...} });
window.gio('clearUser');
```

### Common Development Tasks

- **Change SDK settings**: Edit `js/gio-config.js` and reload page
- **Add new test button**: Update `测试.html`, bind listener in `GIOTestHelper.bindEventListeners()`
- **Modify styling**: Edit `css/style.css`
- **Debug SDK issues**: Enable browser console, check for SDK load errors

## Key Conventions & Patterns

### GrowingIO SDK v4 Patterns in This Project

1. **SDK Detection**: Always check if `typeof window.gio === 'function'` before calling SDK methods
2. **Error Handling**: Wrap SDK calls in try-catch to handle load failures gracefully
3. **Logging Pattern**: Use `GIOTestHelper.addLog()` to maintain visible event history with timestamps
4. **Async Event Flow**: SDK calls are typically async; use callbacks if SDK supports them (check v4 docs)

### HTML Structure Conventions

- Use semantic HTML5 elements
- ID-based element selection for JS interactivity (`id="btn-track-event"`, `id="sdk-status"`)
- Status indicators with class-based styling (`status-success`, `status-error`)

## Integration Points & Dependencies

### External Dependencies

- **GrowingIO SDK v4**: Loaded from CDN (`https://cdnjs.cloudflare.com/ajax/libs/gio-web-sdk/4.1.26/gio.js`)
  - Provides `window.gio()` function for tracking and user management
  - Requires `projectId` configuration in `gio-config.js`
  - Reference: http://help-center.growingio.com/@sdk-v4/docs/webjs/integrate.html

### Integration Flow

1. SDK loads from CDN before other scripts
2. `gio-config.js` runs `window.gio('init', {...})` immediately after SDK loads
3. `test.js` uses initialized SDK through `window.gio()` global
4. All SDK calls are wrapped with existence checks for robustness

## File Structure Reference

```
.
├── .github/
│   └── copilot-instructions.md
├── test/                       # Future test files
├── 测试.html                    # Main HTML file
└── .DS_Store
```
