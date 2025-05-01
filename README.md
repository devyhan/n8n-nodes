# n8n-nodes-xcode-build

This package provides a node for executing Xcode build commands in n8n workflows. You can automate building, cleaning, archiving, and testing Xcode projects on a local macOS environment or on a remote macOS server via SSH.

## Features

- **Various Xcode Operations**: Build, Clean, Archive, Test
- **Execution Modes**:
  - Local Execution: Direct execution when n8n is running on macOS
  - Remote SSH Execution: Execute commands on a remote macOS host
- **SSH Authentication Methods**:
  - Password Authentication
  - SSH Key Authentication (Private Key)
- **Uses n8n Built-in SSH Credentials**: Reuse existing SSH settings for simplified configuration

## Installation

To install this node in n8n:

1. Navigate to your n8n installation directory:
```bash
cd ~/.n8n
```

2. Install the node package:
```bash
npm install n8n-nodes-xcode-build
```

3. Restart n8n:
```bash
n8n restart
```

## Usage

### Basic Configuration

1. Add an 'Xcode Build' node to your n8n workflow
2. Select the execution mode:
   - `SSH`: Execute on a remote macOS server (default)
   - `Local`: Execute on the local macOS environment
3. If SSH mode is selected, set up the SSH authentication method and credentials
4. Choose the operation type (Build, Clean, Archive, Test)
5. Set the project path and scheme

### SSH Credentials Setup

This node uses n8n's built-in SSH credentials:
1. Go to Credentials in the n8n menu
2. Click 'Create New Credentials'
3. Select the 'SSH' credential type (Password or Private Key)
4. Enter the required information (host, port, username, password or private key)
5. Save and select these credentials in the Xcode Build node

### Operation Settings

You can configure various settings for each operation type:

#### Build
- Project Path: Path to the Xcode project or workspace directory
- Scheme: Name of the scheme to build
- Configuration: Debug or Release
- Destination: Build target (e.g., "platform=iOS Simulator,name=iPhone 15")
- Additional Build Options: Other xcodebuild command options

#### Clean
- Project Path and Scheme settings
- Option to clean DerivedData

#### Archive
- Project Path and Scheme settings
- Archive Path specification (optional)

#### Test
- Project Path and Scheme settings
- Test Plan specification (optional)
- Skip build option

## Development

### Requirements

- Node.js (v16+ recommended)
- npm or yarn
- TypeScript

### Getting Started with Development

1. Clone the repository:
```bash
git clone [repository URL]
cd n8n-nodes-xcode-build
```

2. Install dependencies:
```bash
npm install
```

3. Run development build:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## License

MIT

## Contributing

Issues, pull requests, and improvement suggestions are always welcome!
