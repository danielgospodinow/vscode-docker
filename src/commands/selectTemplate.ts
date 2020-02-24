/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IActionContext, IAzureQuickPickItem, UserCancelledError } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { resolveVariables } from '../utils/resolveVariables';

export enum TemplateCommands {
    AttachShell,
    ViewLogs,
}

type CommandTemplate = {
    template: string,
    label?: string,
    match?: string,
};

export async function selectTemplate(context: IActionContext, command: TemplateCommands, matchContext?: string, folder?: vscode.WorkspaceFolder, additionalVariables?: { [key: string]: string }): Promise<string> {
    let commandSetting: string;
    let backupLabel: string;

    switch (command) {
        case TemplateCommands.AttachShell:
            backupLabel = 'Attach Shell';
            commandSetting = 'commands.logs';
            break;
        case TemplateCommands.ViewLogs:
            backupLabel = 'View Logs';
            commandSetting = 'commands.logs';
            break;
        default:
            throw new Error(`Unknown template command type: '${command}'`);
    }

    // Get the templates from settings
    const config = vscode.workspace.getConfiguration('docker');
    let templates: CommandTemplate[] = config.get(commandSetting) ?? [];

    // Make sure all templates have some sort of label
    templates.forEach(template => {
        template.label = template.label ?? backupLabel;
    })

    // Filter off non-matching / invalid templates
    templates = templates.filter(template => {
        if (!template.template) {
            // Don't wait
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            ext.ui.showWarningMessage(`No command template defined for template '${template.label}'. This template will be skipped.`);
            return false;
        }

        if (!template.match) {
            return true;
        }

        try {
            return new RegExp(template.match, 'ig').test(matchContext);
        } catch {
            // Don't wait
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            ext.ui.showWarningMessage(`Invalid match expression for template '${template.label}'. This template will be skipped.`);
            return false;
        }
    });

    // TODO: Should we also define the default settings in this file, and fall back to it if needed, thus ensuring that there will always be at least one match?
    // Note: I don't think it's possible to use VSCode APIs to look up the default setting, so it would have to be defined both here and package.json
    if (templates.length === 0) {
        // No templates matched or user went and deleted everything, this is not a bug so don't show report issue button
        context.errorHandling.suppressReportIssue = true;
        throw new Error(`No matching templates were found in configuration for template command '${command}'. Please restore the default settings for the template command or define at least one matching template.`);
    }

    const selectedTemplate = await quickPickTemplate(context, templates);

    return resolveVariables(selectedTemplate.template, folder, additionalVariables);
}

async function quickPickTemplate(context: IActionContext, templates: CommandTemplate[]): Promise<CommandTemplate> {
    if (templates.length === 1) {
        // No need to prompt if only one remains
        return templates[0];
    }

    const items: IAzureQuickPickItem<CommandTemplate>[] = templates.map(template => {
        return {
            label: template.label,
            detail: template.template,
            data: template,
        }
    });

    const selection = await ext.ui.showQuickPick(items, {
        placeHolder: 'Choose a command template to execute'
    });

    if (!selection) {
        throw new UserCancelledError();
    }

    return selection.data;
}