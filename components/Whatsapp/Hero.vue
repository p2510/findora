<template>
  <div>
    <div class="shine-effect"></div>
    <img src="~/assets/img/whatsapp_connect.png" class="" alt="" />
  </div>
</template>
<style scoped>
/* Effet de lumière */
.shine-effect {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shine 3.5s forwards;
  animation-delay: 2s;
  pointer-events: none;
}

@keyframes shine {
  from {
    left: -150%;
  }
  to {
    left: 150%;
  }
}
</style>
