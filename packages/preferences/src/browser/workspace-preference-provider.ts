/********************************************************************************
 * Copyright (C) 2018 Ericsson and others.
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

import { inject, injectable, postConstruct, named } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { PreferenceScope, PreferenceProvider } from '@theia/core/lib/browser/preferences';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { WorkspaceFilePreferenceProviderFactory, WorkspaceFilePreferenceProvider } from './workspace-file-preference-provider';

@injectable()
export class WorkspacePreferenceProvider extends PreferenceProvider {

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(WorkspaceFilePreferenceProviderFactory)
    protected readonly workspaceFileProviderFactory: WorkspaceFilePreferenceProviderFactory;

    @inject(PreferenceProvider) @named(PreferenceScope.Folder)
    protected readonly folderPreferenceProvider: PreferenceProvider;

    protected delegate: PreferenceProvider | undefined;

    @postConstruct()
    protected async init(): Promise<void> {
        this._ready.resolve();
        this.update();
        this.workspaceService.onWorkspaceLocationChanged(() => this.update());
    }

    getUri(): URI | undefined {
        // TODO get from underlying provider
        const workspace = this.workspaceService.workspace;
        if (workspace) {
            const uri = new URI(workspace.uri);
            // TODO .vscode/settings.json
            return workspace.isDirectory ? uri.resolve('.theia').resolve('settings.json') : uri;
        }
        return undefined;
    }

    protected readonly toDisposeOnUpdate = new DisposableCollection();
    protected update(): void {
        const delegate = this.createDelegate();
        if (delegate !== delegate) {
            this.toDisposeOnUpdate.dispose();
            this.toDispose.push(this.toDisposeOnUpdate);

            this.delegate = delegate;

            if (delegate instanceof WorkspaceFilePreferenceProvider) {
                this.toDisposeOnUpdate.pushAll([
                    delegate,
                    delegate.onDidPreferencesChanged(changes => this.onDidPreferencesChangedEmitter.fire(changes))
                ]);
            }
            this.onDidPreferencesChangedEmitter.fire(undefined);
        }
    }
    protected createDelegate(): PreferenceProvider | undefined {
        const workspace = this.workspaceService.workspace;
        if (!workspace) {
            return undefined;
        }
        if (workspace.isDirectory) {
            return this.folderPreferenceProvider;
        }
        return this.workspaceFileProviderFactory({
            workspaceUri: new URI(workspace.uri)
        });
    }

    canProvide(preferenceName: string, resourceUri?: string): { priority: number, provider: PreferenceProvider } {
        return this.delegate ? this.delegate.canProvide(preferenceName, resourceUri) : super.canProvide(preferenceName, resourceUri);
    }

    // tslint:disable-next-line:no-any
    getPreferences(resourceUri?: string): { [p: string]: any } {
        return this.delegate ? this.delegate.getPreferences(resourceUri) : {};
    }

    // tslint:disable-next-line:no-any
    async setPreference(preferenceName: string, value: any, resourceUri?: string): Promise<void> {
        if (this.delegate) {
            await this.delegate.setPreference(preferenceName, value, resourceUri);
        }
    }

}
