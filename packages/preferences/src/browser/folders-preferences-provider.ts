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

import { inject, injectable, postConstruct } from 'inversify';
import { PreferenceProvider, PreferenceProviderPriority } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { FolderPreferenceProvider, FolderPreferenceProviderFactory, FolderPreferenceProviderOptions } from './folder-preference-provider';
import { FileSystem } from '@theia/filesystem/lib/common';
import URI from '@theia/core/lib/common/uri';

@injectable()
export class FoldersPreferencesProvider extends PreferenceProvider {

    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(FileSystem) protected readonly fileSystem: FileSystem;
    @inject(FolderPreferenceProviderFactory) protected readonly folderPreferenceProviderFactory: FolderPreferenceProviderFactory;

    protected readonly providers = new Map<string, FolderPreferenceProvider>();

    @postConstruct()
    protected async init(): Promise<void> {
        await this.workspaceService.roots;

        this.updateProviders();
        this.workspaceService.onWorkspaceChanged(() => this.updateProviders());

        const readyPromises: Promise<void>[] = [];
        for (const provider of this.providers.values()) {
            readyPromises.push(provider.ready.catch(e => console.error(e)));
        }
        Promise.all(readyPromises).then(() => this._ready.resolve());
    }

    protected updateProviders(): void {
        const roots = this.workspaceService.tryGetRoots();
        const toDelete = new Set(this.providers.keys());
        for (const folder of roots) {
            // prefere theia over vscode
            for (const configPath of ['.theia', '.vscode']) {
                // prefer launch over settings
                for (const configFileName of ['launch.json', 'settings.json']) {
                    const configUri = new URI(folder.uri).resolve(configPath).resolve(configFileName);
                    const key = configUri.toString();
                    toDelete.delete(key);
                    if (!this.providers.has(key)) {
                        const provider = this.createProvider({ folder, configUri });
                        this.providers.set(key, provider);
                    }
                }
            }
        }
        for (const key of toDelete) {
            const provider = this.providers.get(key);
            if (provider) {
                this.providers.delete(key);
                provider.dispose();
            }
        }
    }

    // tslint:disable-next-line:no-any
    getPreferences(resourceUri?: string): { [p: string]: any } {
        const result = {};
        for (const provider of this.getProviders(resourceUri).reverse()) {
            const preferences = provider.getPreferences();
            Object.assign(result, preferences);
        }
        return result;
    }

    canProvide(preferenceName: string, resourceUri?: string): { priority: number, provider: PreferenceProvider } {
        return this.getProvider(preferenceName, resourceUri) || super.canProvide(preferenceName, resourceUri);
    }

    // tslint:disable-next-line:no-any
    async setPreference(preferenceName: string, value: any, resourceUri?: string): Promise<void> {
        const info = this.getProvider(preferenceName, resourceUri);
        if (info) {
            await info.provider.setPreference(preferenceName, value);
        }
    }

    protected getProvider(preferenceName: string, resourceUri?: string): { priority: number, provider: PreferenceProvider } | undefined {
        const providers = this.getProviders(resourceUri);
        for (const provider of providers) {
            const priority = provider.canProvide(preferenceName, resourceUri).priority;
            if (priority !== PreferenceProviderPriority.NA) {
                return { priority, provider };
            }
        }
        return undefined;
    }

    protected getProviders(resourceUri?: string): FolderPreferenceProvider[] {
        if (!resourceUri) {
            return [];
        }
        const resourcePath = new URI(resourceUri).path;
        let relativity = -1;
        const providers = new Map<number, FolderPreferenceProvider[]>();
        for (const provider of this.providers.values()) {
            const folderRelativity = provider.folderUri.path.relativity(resourcePath);
            if (folderRelativity >= 0 && relativity <= folderRelativity) {
                relativity = folderRelativity;

                const folderProviders = (providers.get(relativity) || []);
                folderProviders.push(provider);
                providers.set(relativity, folderProviders);
            }
        }
        return providers.get(relativity) || [];
    }

    protected createProvider(options: FolderPreferenceProviderOptions): FolderPreferenceProvider {
        const provider = this.folderPreferenceProviderFactory(options);
        this.toDispose.push(provider);
        this.toDispose.push(provider.onDidPreferencesChanged(change => this.onDidPreferencesChangedEmitter.fire(change)));
        return provider;
    }

}
