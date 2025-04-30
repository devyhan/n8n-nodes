"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.getInputData();
            const returnData = [];
            // 노드 파라미터 및 실행 로직
            let item;
            for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
                try {
                    const operation = this.getNodeParameter('operation', itemIndex, '');
                    const projectPath = this.getNodeParameter('projectPath', itemIndex, '');
                    // 프로젝트 경로 유효성 확인
                    if (!(0, fs_1.existsSync)(projectPath)) {
                        throw new Error(`Project path does not exist: ${projectPath}`);
                    }
                    let command = '';
                    let output = '';
                    // 공통 옵션 설정
                    const scheme = this.getNodeParameter('scheme', itemIndex, '');
                    const configuration = this.getNodeParameter('configuration', itemIndex, 'Debug');
                    const destination = this.getNodeParameter('destination', itemIndex, '');
                    // 기본 명령어 구성
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
                    // 작업별 명령어 설정
                    switch (operation) {
                        case 'build':
                            command = `${baseCommand} build`;
                            break;
                        case 'clean':
                            command = `${baseCommand} clean`;
                            break;
                        case 'archive':
                            const archivePath = this.getNodeParameter('archivePath', itemIndex, '');
                            command = `${baseCommand} archive ${archivePath ? `-archivePath "${archivePath}"` : ''}`;
                            break;
                        case 'test':
                            command = `${baseCommand} test`;
                            break;
                        default:
                            throw new Error(`Unsupported operation: ${operation}`);
                    }
                    // 명령어 실행
                    try {
                        this.logger.info(`Executing command: ${command}`);
                        output = (0, child_process_1.execSync)(command, { encoding: 'utf8' });
                        // 결과 반환
                        item = items[itemIndex];
                        item.json = {
                            success: true,
                            operation,
                            output,
                            command,
                        };
                    }
                    catch (execError) {
                        // 명령 실행 오류 처리
                        this.logger.error(`Error executing command: ${execError}`);
                        throw new Error(`Failed to execute Xcode command: ${execError.message}`);
                    }
                    returnData.push(item);
                }
                catch (error) {
                    if (this.continueOnFail()) {
                        returnData.push({
                            json: {
                                success: false,
                                error: error.message,
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
        });
    }
}
exports.XcodeBuild = XcodeBuild;
