<script setup>
    //Local Constants

    //Variables

    //Model Values
    
    //Built-in Functions
</script>

<template>
    <div
        class="loader"
    >
        <div 
            class="loader-content"
        >
            <v-progress-circular
                :size="70"
                :width="7"
                :indeterminate="true"
                color="blue"
            >
            </v-progress-circular>
        </div>
    </div>
</template>

<style scoped>
.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(255, 255, 255);
}

.loader-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>