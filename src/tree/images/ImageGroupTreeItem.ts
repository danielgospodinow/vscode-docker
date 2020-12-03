/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IconPath } from "../IconPath";
import { LocalGroupTreeItemBase } from "../LocalGroupTreeItemBase";
import { getImageGroupIcon, ImageProperty } from "./ImageProperties";
import { ILocalImageInfo } from "./LocalImageInfo";

export class ImageGroupTreeItem extends LocalGroupTreeItemBase<ILocalImageInfo, ImageProperty> {
    public static readonly contextValue: string = 'imageGroup';
    public readonly contextValue: string = ImageGroupTreeItem.contextValue;
    public childTypeLabel: string = 'image';

    public get iconPath(): IconPath {
        return getImageGroupIcon(this.parent.groupBySetting);
    }
}
