<template>
  <div id="app">
    <nav>
      <router-link to="/provider">Provider</router-link>
      <router-link to="/users">Users</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
}

nav {
  display: flex;
  justify-content: center;
  background-color: #1f2937;
  padding: 1rem;
}

nav a {
  color: white;
  margin: 0 1rem;
  text-decoration: none;
  font-weight: 500;
}

nav a.router-link-active {
  border-bottom: 2px solid #60a5fa;
}

main {
  padding: 2rem;
  display: flex;
  justify-content: center;
}
</style>
