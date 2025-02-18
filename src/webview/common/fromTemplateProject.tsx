/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
import * as React from 'react';
import 'react-dom';
import { Devfile, TemplateProjectIdentifier } from './devfile';
import { DevfileSearch } from './devfileSearch';
import { SetNameAndFolder } from './setNameAndFolder';

type CurrentPage = 'selectTemplateProject' | 'setNameAndFolder';

type FromTemplateProjectProps = {
    titleText: string
    goHome?: () => void;
};

type Message = {
    action: string;
    data: any;
};

export function FromTemplateProject(props: FromTemplateProjectProps) {
    const [currentPage, setCurrentPage] = React.useState<CurrentPage>('selectTemplateProject');
    const [selectedTemplateProject, setSelectedTemplateProject] =
        React.useState<TemplateProjectIdentifier>(undefined);
    const [selectedDevfile, setSelectedDevfile] = React.useState<Devfile>(undefined);
    const [initialComponentParentFolder, setInitialComponentParentFolder] = React.useState<string>(undefined);

    function respondToMessage(messageEvent: MessageEvent) {
        const message = messageEvent.data as Message;
        switch (message.action) {
            case 'initialWorkspaceFolder': {
                setInitialComponentParentFolder(message.data);
                break;
            }
            default:
                break;
       }
    }

    React.useEffect(() => {
        window.addEventListener('message', respondToMessage);
        return () => {
            window.removeEventListener('message', respondToMessage);
        };
    }, []);

    React.useEffect(() => {
        window.vscodeApi.postMessage({ action: 'getInitialWokspaceFolder' });
    }, []);

    function setSelectedProjectAndAdvance(value: TemplateProjectIdentifier) {
        setSelectedTemplateProject((_) => value);
        setCurrentPage((_) => 'setNameAndFolder');
    }

    function createComponent(projectFolder: string, componentName: string, addToWorkspace: boolean, portNumber: number) {
        window.vscodeApi.postMessage({
            action: 'createComponent',
            data: {
                templateProject: selectedTemplateProject,
                projectFolder,
                componentName,
                portNumber,
                isFromTemplateProject: true,
                addToWorkspace
            },
        });
    }

    switch (currentPage) {
        case 'selectTemplateProject':
            return (
                <DevfileSearch
                    setSelectedDevfile={setSelectedDevfile}
                    setSelectedTemplateProject={setSelectedProjectAndAdvance}
                    titleText={props.titleText}
                    goBack={props.goHome}
                />
            );
        case 'setNameAndFolder':
            return (
                <SetNameAndFolder
                    goBack={() => {
                        setCurrentPage('selectTemplateProject');
                    }}
                    createComponent={createComponent}
                    devfile={selectedDevfile}
                    templateProject={selectedTemplateProject.templateProjectName}
                    initialComponentName={selectedTemplateProject.templateProjectName}
                    initialComponentParentFolder={initialComponentParentFolder}
                />
            );
        default:
            break;
    }
}
