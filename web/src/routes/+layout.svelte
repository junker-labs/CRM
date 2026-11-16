<script lang="ts">
	import '../app.css';
	import { auth } from '#lib/auth.svelte.js';
	import Lockup from '#lib/brand/Lockup.svelte';
	import UserMenu from '#lib/profile/UserMenu.svelte';
	import NavCounter from '#lib/todos/NavCounter.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const NAV = [
		{ href: '/leads', label: 'Leads' },
		{ href: '/todos', label: 'To-Dos' },
		{ href: '/kontakte', label: 'Kontakte' },
		{ href: '/unternehmen', label: 'Unternehmen' }
	];

	const isLogin = $derived(page.url.pathname === '/login');

	auth.refresh();

	$effect(() => {
		if (!auth.loggedIn && !isLogin) goto('/login');
		else if (auth.loggedIn && isLogin) goto('/');
	});
</script>

<!-- favicon + apple-touch-icon: static in app.html (browsers ask before this script runs) -->
<svelte:head>
	<title>junker.labs deals</title>
</svelte:head>

{#if isLogin}
	{@render children()}
{:else if auth.loggedIn}
	<!-- phones (390 px): tighter gaps; the navigation scrolls sideways instead of pushing the
	     user menu (profile, dark mode, logout) off the screen -->
	<header class="jl-on-dark flex h-(--header-h) items-center gap-2 bg-header px-3 text-header-foreground sm:gap-6 sm:px-4">
		<a href="/leads" class="flex shrink-0 items-center rounded-md" aria-label="junker.labs deals – Leads">
			<Lockup compact />
		</a>
		<nav class="flex min-w-0 flex-1 gap-1 overflow-x-auto text-sm" aria-label="Hauptnavigation">
			{#each NAV as item (item.href)}
				<a
					href={item.href}
					aria-current={page.url.pathname.startsWith(item.href) ? 'page' : undefined}
					class="shrink-0 rounded-md px-2 py-1.5 whitespace-nowrap text-header-muted hover:text-header-foreground aria-[current=page]:font-medium aria-[current=page]:text-header-foreground aria-[current=page]:nav-active sm:px-3"
				>
					{item.label}
					{#if item.href === '/todos'}<NavCounter />{/if}
				</a>
			{/each}
		</nav>
		<UserMenu />
	</header>
	<main class="h-[calc(100dvh-var(--header-h))]">
		{@render children()}
	</main>
{/if}
