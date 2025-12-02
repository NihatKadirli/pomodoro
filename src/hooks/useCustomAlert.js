import { useState } from 'react';

/**
 * Custom Alert Hook
 * 
 * Kullanım:
 * const { showAlert, AlertComponent } = useCustomAlert();
 * 
 * showAlert({
 *   title: 'Başlık',
 *   message: 'Mesaj',
 *   type: 'success', // 'success', 'warning', 'error', 'info', 'default'
 *   buttons: [
 *     { text: 'İptal', style: 'cancel', onPress: () => {} },
 *     { text: 'Tamam', onPress: () => {} }
 *   ]
 * });
 */
export const useCustomAlert = () => {
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: [],
        icon: null,
        type: 'default',
    });

    const showAlert = ({ title, message, buttons = [], icon = null, type = 'default' }) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons,
            icon,
            type,
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    return {
        showAlert,
        hideAlert,
        alertConfig,
        setAlertConfig,
    };
};
