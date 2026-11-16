<script lang="ts">
	// App-Icon d. + Wortmarke junker.labs + Deskriptor deals. Farben kommen aus den
	// --logo-*-Tokens der Fläche (auf dunklen Flächen: Klasse jl-on-dark am Container).
	import { cn } from '#lib/utils.js';
	import icon from './deals-icon.svg';

	type Props = {
		/** Icon-Kantenlänge, Schriftgröße folgt per Klasse */
		size?: 'sm' | 'lg';
		/** Wortmarke auf schmalen Bildschirmen ausblenden (nur das Icon zeigen) */
		compact?: boolean;
		class?: string;
	};
	let { size = 'sm', compact = false, class: className }: Props = $props();
</script>

<span
	class={cn('inline-flex items-center', size === 'lg' ? 'gap-3' : 'gap-2', className)}
	role="img"
	aria-label="junker.labs deals"
>
	<img src={icon} alt="" class={cn('jl-icon', size === 'lg' ? 'size-11' : 'size-7')} />
	<span class={cn('jl-wordmark', size === 'lg' ? 'text-2xl' : 'text-base', compact && 'hidden sm:inline')}
		>junker<span class="jl-dot">.</span><span class="jl-labs">labs</span><span class="jl-descriptor"
			>deals</span
		></span
	>
</span>
