/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { inject, injectable } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { PreferenceScope, PreferenceProvider, PreferenceProviderPriority } from '@theia/core/lib/browser';
import { AbstractResourcePreferenceProvider } from './abstract-resource-preference-provider';
import { FileSystem, FileStat } from '@theia/filesystem/lib/common';

export const FolderPreferenceProviderFactory = Symbol('FolderPreferenceProviderFactory');
export interface FolderPreferenceProviderFactory {
    (options: FolderPreferenceProviderOptions): FolderPreferenceProvider;
}

export const FolderPreferenceProviderOptions = Symbol('FolderPreferenceProviderOptions');
export interface FolderPreferenceProviderOptions {
    folder: FileStat;
    configUri: URI;
}

@injectable()
export class FolderPreferenceProvider extends AbstractResourcePreferenceProvider {

    readonly folderUri: URI;

    constructor(
        @inject(FolderPreferenceProviderOptions) protected readonly options: FolderPreferenceProviderOptions,
        @inject(FileSystem) protected readonly fileSystem: FileSystem
    ) {
        super();
        this.folderUri = new URI(this.options.folder.uri);
    }

    getUri(): URI {
        return this.options.configUri;
    }

    canProvide(preferenceName: string, resourceUri?: string): { priority: number, provider: PreferenceProvider } {
        const value = this.get(preferenceName);
        if (value === undefined || value === null || !resourceUri) {
            return super.canProvide(preferenceName, resourceUri);
        }
        const uri = new URI(resourceUri);
        return { priority: PreferenceProviderPriority.Folder + this.folderUri.path.relativity(uri.path), provider: this };
    }

    protected getScope() {
        return PreferenceScope.Folder;
    }

    getDomain(): string[] {
        return [this.folderUri.toString()];
    }

    // tslint:disable-next-line:no-any
    protected async getParsedContent(content: string): Promise<{ [key: string]: any }> {
        const preferences = await super.getParsedContent(content);
        if ('launch' in preferences && preferences['launch']) {
            Object.assign(preferences['launch'], { __configUri: this.options.configUri });
        }
        return preferences;
    }
}
