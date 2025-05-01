import { INodeProperties } from 'n8n-workflow';

// 작업별 특화 파라미터 정의
const buildOperation: INodeProperties[] = [
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

const cleanOperation: INodeProperties[] = [
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

const archiveOperation: INodeProperties[] = [
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

const testOperation: INodeProperties[] = [
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
export const xcodeBuildFields: INodeProperties[] = [
	...buildOperation,
	...cleanOperation,
	...archiveOperation,
	...testOperation,
];

// 공통 파라미터는 메인 노드 파일에서 직접 정의
export const xcodeBuildOperations: INodeProperties[] = [];
