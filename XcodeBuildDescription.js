"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xcodeBuildFields = exports.xcodeBuildOperations = void 0;
// 공통 파라미터 정의
exports.xcodeBuildOperations = [
    {
        displayName: 'Project Path',
        name: 'projectPath',
        type: 'string',
        default: '',
        placeholder: '/Users/username/Projects/MyApp',
        description: 'Path to the Xcode project or workspace directory',
        required: true,
    },
    {
        displayName: 'Scheme',
        name: 'scheme',
        type: 'string',
        default: '',
        description: 'Build scheme to use',
        required: true,
    },
    {
        displayName: 'Configuration',
        name: 'configuration',
        type: 'options',
        options: [
            {
                name: 'Debug',
                value: 'Debug',
            },
            {
                name: 'Release',
                value: 'Release',
            },
        ],
        default: 'Debug',
        description: 'Build configuration',
    },
    {
        displayName: 'Destination',
        name: 'destination',
        type: 'string',
        default: 'platform=iOS Simulator,name=iPhone 15',
        description: 'Target destination for build (e.g., "platform=iOS Simulator,name=iPhone 15")',
    },
];
// 작업별 특화 파라미터 정의
const buildOperation = [
    {
        displayName: 'Additional Build Options',
        name: 'buildOptions',
        type: 'string',
        default: '',
        placeholder: '-skipPackagePluginValidation -quiet',
        description: 'Additional command line options for xcodebuild',
        displayOptions: {
            show: {
                operation: ['build'],
            },
        },
    },
];
const cleanOperation = [
    {
        displayName: 'Clean Derived Data',
        name: 'cleanDerivedData',
        type: 'boolean',
        default: false,
        description: 'Also clean derived data folder',
        displayOptions: {
            show: {
                operation: ['clean'],
            },
        },
    },
];
const archiveOperation = [
    {
        displayName: 'Archive Path',
        name: 'archivePath',
        type: 'string',
        default: '',
        placeholder: '/Users/username/Archives/MyApp.xcarchive',
        description: 'Path where the archive will be created',
        displayOptions: {
            show: {
                operation: ['archive'],
            },
        },
    },
];
const testOperation = [
    {
        displayName: 'Test Plan',
        name: 'testPlan',
        type: 'string',
        default: '',
        description: 'Test plan to use',
        displayOptions: {
            show: {
                operation: ['test'],
            },
        },
    },
    {
        displayName: 'Test Without Building',
        name: 'testWithoutBuilding',
        type: 'boolean',
        default: false,
        description: 'Run tests without building the target',
        displayOptions: {
            show: {
                operation: ['test'],
            },
        },
    },
];
// 모든 작업별 파라미터 결합
exports.xcodeBuildFields = [
    ...buildOperation,
    ...cleanOperation,
    ...archiveOperation,
    ...testOperation,
];
