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

import { injectable } from 'inversify';
import ElectronStorage = require('electron-store');

interface StringMap {
    [key: string]: any // tslint:disable-line:no-any
}

export const ElectronStorageService = Symbol('ElectronStorageService');
export interface ElectronStorageService {
    // tslint:disable-next-line:no-any
    get<T extends StringMap = any, K extends keyof T = keyof T>(key: K): T[K] | undefined
    // tslint:disable-next-line:no-any
    get<T extends StringMap = any, K extends keyof T = keyof T>(key: K, defaultValue: T[K]): T[K]

    // tslint:disable-next-line:no-any
    set<T extends StringMap = any, K extends keyof T = keyof T>(key: K, value: T[K]): this
}

@injectable()
export class ElectronStorageServiceImpl implements ElectronStorageService {

    // tslint:disable-next-line:no-any
    protected readonly electronStore = new ElectronStorage<any>();

    // tslint:disable-next-line:no-any
    get<T extends StringMap = any, K extends keyof T = keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined {
        return this.electronStore.get(key, defaultValue);
    }

    // tslint:disable-next-line:no-any
    set<T extends StringMap = any, K extends keyof T = keyof T>(key: K, value: T[K]): this {
        this.electronStore.set(key, value);
        return this;
    }

}
