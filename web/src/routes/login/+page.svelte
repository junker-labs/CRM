<script lang="ts">
	import { auth } from '#lib/auth.svelte.js';
	import Lockup from '#lib/brand/Lockup.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = '';
		try {
			await auth.login(email, password);
			goto('/');
		} catch {
			error = 'Anmeldung fehlgeschlagen.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Anmelden – junker.labs deals</title></svelte:head>

<div class="relative isolate flex min-h-dvh items-center justify-center overflow-hidden p-4">
	<!-- soft amber and ink shapes behind the glass (brand: glass only works with shapes) -->
	<div class="jl-shapes absolute inset-0 -z-10" aria-hidden="true"></div>
	<div class="grid w-full max-w-sm gap-4">
		<!-- brand area on glass; the form itself stays on an opaque card (no glass for forms) -->
		<div class="jl-glass grid gap-4 rounded-xl p-6">
			<Lockup size="lg" />
			<p class="font-display text-2xl leading-snug font-bold">
				<span class="emphasis">Deals</span> statt Dashboards.
			</p>
		</div>
		<Card.Root>
			<!-- the form carries the card's spacing, see docs/pitfalls/designsystem.md -->
			<form class="flex flex-col gap-(--card-spacing)" onsubmit={submit}>
				<Card.Header>
					<Card.Title>Anmeldung</Card.Title>
				</Card.Header>
				<Card.Content class="grid gap-4">
					<div class="grid gap-1.5">
						<Label for="email">E-Mail</Label>
						<Input id="email" type="email" bind:value={email} required autocomplete="username" />
					</div>
					<div class="grid gap-1.5">
						<Label for="password">Passwort</Label>
						<Input
							id="password"
							type="password"
							bind:value={password}
							required
							autocomplete="current-password"
						/>
					</div>
					{#if error}<p class="text-sm text-destructive">{error}</p>{/if}
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="w-full" disabled={busy}>Anmelden</Button>
				</Card.Footer>
			</form>
		</Card.Root>
	</div>
</div>
