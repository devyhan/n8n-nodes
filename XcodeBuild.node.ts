import { NodeOperationError } from 'n8n-workflow';
import type {
  ICredentialDataDecryptedObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { NodeSSH } from 'node-ssh';
import { xcodeBuildOperations, xcodeBuildFields } from './XcodeBuildDescription';

export class XcodeBuild implements INodeType {
  description: INodeTypeDescription = {
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
    // @ts-ignore - 타입 체크 무시
    inputs: ['main'],
    // @ts-ignore - 타입 체크 무시
    outputs: ['main'],
    credentials: [
      {
        name: 'sshPassword',
        required: true,
        testedBy: 'sshConnectionTest',
        displayOptions: {
          show: {
            executionMode: ['ssh'],
            authentication: ['password'],
          },
        },
      },
      {
        name: 'sshPrivateKey',
        required: true,
        testedBy: 'sshConnectionTest',
        displayOptions: {
          show: {
            executionMode: ['ssh'],
            authentication: ['privateKey'],
          },
        },
      },
    ],
    properties: [
      {
        displayName: 'Execution Mode',
        name: 'executionMode',
        type: 'options',
        options: [
          {
            name: 'Local',
            value: 'local',
            description: 'Execute directly on n8n host (works only if n8n is running on macOS)',
          },
          {
            name: 'Remote SSH',
            value: 'ssh',
            description: 'Execute via SSH on a remote macOS host (requires SSH credentials)',
          },
        ],
        default: 'ssh',
        description: 'How to execute the Xcode commands',
      },
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          {
            name: 'Password',
            value: 'password',
          },
          {
            name: 'Private Key',
            value: 'privateKey',
          },
        ],
        default: 'password',
        description: 'SSH authentication method',
        displayOptions: {
          show: {
            executionMode: ['ssh'],
          },
        },
      },
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
      ...xcodeBuildFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    
    const executionMode = this.getNodeParameter('executionMode', 0, 'local') as string;
    
    if (executionMode === 'local') {
      // 로컬 실행 모드
      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        try {
          const operation = this.getNodeParameter('operation', itemIndex, '') as string;
          const projectPath = this.getNodeParameter('projectPath', itemIndex, '') as string;
          
          // 프로젝트 경로 유효성 확인
          if (!existsSync(projectPath)) {
            throw new Error(`Project path does not exist: ${projectPath}`);
          }
          
          let command = '';
          let output = '';
          
          // 공통 옵션 설정
          const scheme = this.getNodeParameter('scheme', itemIndex, '') as string;
          const configuration = this.getNodeParameter('configuration', itemIndex, 'Debug') as string;
          const destination = this.getNodeParameter('destination', itemIndex, '') as string;
          
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
          switch(operation) {
            case 'build':
              const buildOptions = this.getNodeParameter('buildOptions', itemIndex, '') as string;
              command = `${baseCommand} build ${buildOptions}`;
              break;
            case 'clean':
              const cleanDerivedData = this.getNodeParameter('cleanDerivedData', itemIndex, false) as boolean;
              command = `${baseCommand} clean`;
              if (cleanDerivedData) {
                command += ` && rm -rf ~/Library/Developer/Xcode/DerivedData`;
              }
              break;
            case 'archive':
              const archivePath = this.getNodeParameter('archivePath', itemIndex, '') as string;
              command = `${baseCommand} archive`;
              if (archivePath) {
                command += ` -archivePath "${archivePath}"`;
              }
              break;
            case 'test':
              const testPlan = this.getNodeParameter('testPlan', itemIndex, '') as string;
              const testWithoutBuilding = this.getNodeParameter('testWithoutBuilding', itemIndex, false) as boolean;
              
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
          
          // 명령어 실행
          try {
            console.log(`Executing local command: ${command}`);
            output = execSync(command, { encoding: 'utf8' });
            
            // 결과 반환
            const returnItem: INodeExecutionData = {
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
            
          } catch (execError: any) {
            // 명령 실행 오류 처리
            console.error(`Error executing command: ${execError}`);
            throw new Error(`Failed to execute Xcode command: ${execError.message}`);
          }
        } catch (error: any) {
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
          throw new NodeOperationError(this.getNode(), error, {
            itemIndex,
          });
        }
      }
    } else {
      // SSH 실행 모드
      // SSH 인증 정보 가져오기
      let credentials: ICredentialDataDecryptedObject;
      const authentication = this.getNodeParameter('authentication', 0) as string;
      
      try {
        if (authentication === 'password') {
          credentials = await this.getCredentials('sshPassword');
        } else { // privateKey
          credentials = await this.getCredentials('sshPrivateKey');
        }
      } catch (error) {
        throw new Error('SSH 인증 정보를 찾을 수 없습니다. 원격 실행 모드에서는 SSH 인증 정보가 필요합니다.');
      }
      
      // SSH 연결 설정
      const sshConfig: any = {
        host: credentials.host as string,
        port: credentials.port as number || 22,
        username: credentials.username as string,
        readyTimeout: 10000, // 10초 타임아웃
      };
      
      if (authentication === 'password') {
        sshConfig.password = credentials.password as string;
      } else {
        sshConfig.privateKey = credentials.privateKey as string;
        if (credentials.passphrase) {
          sshConfig.passphrase = credentials.passphrase as string;
        }
      }
      
      const ssh = new NodeSSH();
      
      try {
        // SSH 연결
        await ssh.connect(sshConfig);
        console.log('SSH connection established successfully');
        
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
          try {
            const operation = this.getNodeParameter('operation', itemIndex, '') as string;
            const projectPath = this.getNodeParameter('projectPath', itemIndex, '') as string;
            
            let command = '';
            
            // 공통 옵션 설정
            const scheme = this.getNodeParameter('scheme', itemIndex, '') as string;
            const configuration = this.getNodeParameter('configuration', itemIndex, 'Debug') as string;
            const destination = this.getNodeParameter('destination', itemIndex, '') as string;
            
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
            switch(operation) {
              case 'build':
                const buildOptions = this.getNodeParameter('buildOptions', itemIndex, '') as string;
                command = `${baseCommand} build ${buildOptions}`;
                break;
              case 'clean':
                const cleanDerivedData = this.getNodeParameter('cleanDerivedData', itemIndex, false) as boolean;
                command = `${baseCommand} clean`;
                if (cleanDerivedData) {
                  command += ` && rm -rf ~/Library/Developer/Xcode/DerivedData`;
                }
                break;
              case 'archive':
                const archivePath = this.getNodeParameter('archivePath', itemIndex, '') as string;
                command = `${baseCommand} archive`;
                if (archivePath) {
                  command += ` -archivePath "${archivePath}"`;
                }
                break;
              case 'test':
                const testPlan = this.getNodeParameter('testPlan', itemIndex, '') as string;
                const testWithoutBuilding = this.getNodeParameter('testWithoutBuilding', itemIndex, false) as boolean;
                
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
            
            // SSH를 통한 명령어 실행
            try {
              console.log(`Executing command via SSH: ${command}`);
              
              // 원격 호스트에서 프로젝트 경로 존재 여부 확인
              const { stdout: checkResult, stderr: checkError } = await ssh.execCommand(`test -d "${projectPath}" && echo "exists" || echo "not exists"`);
              
              if (checkResult.trim() === 'not exists') {
                throw new Error(`Project path does not exist on remote host: ${projectPath}`);
              }
              
              const { stdout, stderr } = await ssh.execCommand(command);
              
              if (stderr && !stdout) {
                throw new Error(`Failed to execute Xcode command: ${stderr}`);
              }
              
              // 결과 반환
              const returnItem: INodeExecutionData = {
                json: {
                  success: true,
                  operation,
                  output: stdout,
                  stderr: stderr || '',
                  command,
                },
                pairedItem: {
                  item: itemIndex,
                },
              };
              
              returnData.push(returnItem);
              
            } catch (execError: any) {
              // 명령 실행 오류 처리
              console.error(`Error executing command via SSH: ${execError}`);
              throw new Error(`Failed to execute Xcode command: ${execError.message}`);
            }
            
          } catch (error: any) {
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
            throw new NodeOperationError(this.getNode(), error, {
              itemIndex,
            });
          }
        }
        
      } catch (sshError: any) {
        throw new Error(`SSH Connection Error: ${sshError.message}`);
      } finally {
        // SSH 연결 종료
        if (ssh) {
          ssh.dispose();
          console.log('SSH connection closed');
        }
      }
    }
    
    return [returnData];
  }
}
