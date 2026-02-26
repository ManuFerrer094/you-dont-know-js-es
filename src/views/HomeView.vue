<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue'
import StatsSection from '@/components/home/StatsSection.vue'
import BookGrid from '@/components/home/BookGrid.vue'
import CtaSection from '@/components/home/CtaSection.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen pt-14">
    <hero-section />
    <stats-section />
    <book-grid />
    <cta-section />
    <app-footer />
  </div>
</template>
