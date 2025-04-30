"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XcodeBuild = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const XcodeBuildDescription_1 = require("./XcodeBuildDescription");
class XcodeBuild {
    constructor() {
        this.description = {
            displayName: 'Xcode Build',
            name: 'xcodeBuild',
            icon: 'file:xcode.svg',
            group: ['build'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Execute Xcode build commands via CLI',
            defaults: {
                name: 'Xcode Build',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Build',
                            value: 'build',
                            description: 'Build Xcode project',
                        },
                        {
                            name: 'Clean',
                            value: 'clean',
                            description: 'Clean Xcode project',
                        },
                        {
                            name: 'Archive',
                            value: 'archive',
                            description: 'Archive Xcode project',
                        },
                        {
                            name: 'Test',
                            value: 'test',
                            description: 'Run tests on Xcode project',
                        },
                    ],
                    default: 'build',
                },
                ...XcodeBuildDescription_1.xcodeBuildOperations,
                ...XcodeBuildDescription_1.xcodeBuildFields,
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const operation = this.getNodeParameter('operation', itemIndex, '');
                const projectPath = this.getNodeParameter('projectPath', itemIndex, '');
                if (!(0, fs_1.existsSync)(projectPath)) {
                    throw new Error(`Project path does not exist: ${projectPath}`);
                }
                let command = '';
                let output = '';
                const scheme = this.getNodeParameter('scheme', itemIndex, '');
                const configuration = this.getNodeParameter('configuration', itemIndex, 'Debug');
                const destination = this.getNodeParameter('destination', itemIndex, '');
                let baseCommand = `cd "${projectPath}" && xcodebuild`;
                if (scheme) {
                    baseCommand += ` -scheme "${scheme}"`;
                }
                if (configuration) {
                    baseCommand += ` -configuration "${configuration}"`;
                }
                if (destination) {
                    baseCommand += ` -destination "${destination}"`;
                }
                switch (operation) {
                    case 'build':
                        const buildOptions = this.getNodeParameter('buildOptions', itemIndex, '');
                        command = `${baseCommand} build ${buildOptions}`;
                        break;
                    case 'clean':
                        const cleanDerivedData = this.getNodeParameter('cleanDerivedData', itemIndex, false);
                        command = `${baseCommand} clean`;
                        if (cleanDerivedData) {
                            command += ` && rm -rf ~/Library/Developer/Xcode/DerivedData`;
                        }
                        break;
                    case 'archive':
                        const archivePath = this.getNodeParameter('archivePath', itemIndex, '');
                        command = `${baseCommand} archive`;
                        if (archivePath) {
                            command += ` -archivePath "${archivePath}"`;
                        }
                        break;
                    case 'test':
                        const testPlan = this.getNodeParameter('testPlan', itemIndex, '');
                        const testWithoutBuilding = this.getNodeParameter('testWithoutBuilding', itemIndex, false);
                        command = `${baseCommand} test`;
                        if (testPlan) {
                            command += ` -testPlan "${testPlan}"`;
                        }
                        if (testWithoutBuilding) {
                            command += ` -skipBuild`;
                        }
                        break;
                    default:
                        throw new Error(`Unsupported operation: ${operation}`);
                }
                try {
                    console.log(`Executing command: ${command}`);
                    output = (0, child_process_1.execSync)(command, { encoding: 'utf8' });
                    const returnItem = {
                        json: {
                            success: true,
                            operation,
                            output,
                            command,
                        },
                        pairedItem: {
                            item: itemIndex,
                        },
                    };
                    returnData.push(returnItem);
                }
                catch (execError) {
                    console.error(`Error executing command: ${execError}`);
                    throw new Error(`Failed to execute Xcode command: ${execError.message}`);
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            success: false,
                            error: error.message,
                        },
                        pairedItem: {
                            item: itemIndex,
                        },
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                    itemIndex,
                });
            }
        }
        return [returnData];
    }
}
exports.XcodeBuild = XcodeBuild;
//# sourceMappingURL=XcodeBuild.node.js.map