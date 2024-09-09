import { persistent } from '@furudean/svelte-persistent-store';

const defaultSettings = { opponentMuted: false };

const { subscribe, update, set } = persistent({
	start_value: defaultSettings,
	key: 'settings',
	storage_type: 'localStorage'
});

export const settings = {
	subscribe: subscribe,
	muteOpponent: (/** @type {boolean} */ value) =>
		update((settings) => {
			settings.opponentMuted = value;
			return settings;
		}),
	reset: () => set(defaultSettings)
};
