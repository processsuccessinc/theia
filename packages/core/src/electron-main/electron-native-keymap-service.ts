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

import nativeKeymap = require('native-keymap');
import { injectable } from 'inversify';

export const ElectronNativeKeymapService = Symbol('ElectronNativeKeymapService');
export interface ElectronNativeKeymapService {
    isISOKeyboard(): boolean
    getKeyMap(): nativeKeymap.IKeyboardMapping
    getCurrentKeyboardLayout(): nativeKeymap.IKeyboardLayoutInfo
    onDidChangeKeyboardLayout(listener: () => void): this
}

/**
 * Essentially just a wrapper around `native-keymap`.
 */
@injectable()
export class ElectronNativeKeymapServiceImpl implements ElectronNativeKeymapService {

    isISOKeyboard(): boolean {
        return nativeKeymap.isISOKeyboard();
    }

    getKeyMap(): nativeKeymap.IKeyboardMapping {
        return nativeKeymap.getKeyMap();
    }

    getCurrentKeyboardLayout(): nativeKeymap.IKeyboardLayoutInfo {
        return nativeKeymap.getCurrentKeyboardLayout();
    }

    onDidChangeKeyboardLayout(listener: () => void): this {
        nativeKeymap.onDidChangeKeyboardLayout(listener);
        return this;
    }

}
