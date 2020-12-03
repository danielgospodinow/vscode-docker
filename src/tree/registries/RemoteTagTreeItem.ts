/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as moment from 'moment';
import { AzExtTreeItem } from "vscode-azureextensionui";
import { getThemedIconPath, IconPath } from '../IconPath';
import { getRegistryContextValue, tagSuffix } from './registryContextValues';
import { RemoteRepositoryTreeItemBase } from './RemoteRepositoryTreeItemBase';

export class RemoteTagTreeItem extends AzExtTreeItem {
    public parent: RemoteRepositoryTreeItemBase;
    public tag: string;
    public time: Date;

    public constructor(parent: RemoteRepositoryTreeItemBase, tag: string, time: string) {
        super(parent);
        this.tag = tag;
        this.time = new Date(time);
    }

    public get label(): string {
        return this.tag;
    }

    public get contextValue(): string {
        return getRegistryContextValue(this, tagSuffix);
    }

    /**
     * The fullTag minus the registry part
     */
    public get repoNameAndTag(): string {
        return this.parent.repoName + ':' + this.tag;
    }

    public get description(): string {
        return moment(this.time).fromNow();
    }

    public get iconPath(): IconPath {
        return getThemedIconPath('tag');
    }
}
