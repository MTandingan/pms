<script setup>
    import { ref, onMounted } from 'vue';

    //Local Constants

    //Variables
    const emits = defineEmits(["intersect"]);

    //Model Values
    const observer = ref(null);
    const root = ref(null);
    
    //Built-in Functions
    onMounted(() => {
        observer.value = new IntersectionObserver(([entry]) => {
            if(entry && entry.isIntersecting){
                emits("intersect");
            }
        })

        observer.value.observe(root.value);
    })

    //User-defined Functions
</script>

<template>
        <div 
            class="observer" 
            ref="root">
        </div>
</template>

<style scoped>
    .observer {
        height: 10px;
        width: 10px;
    }
</style>