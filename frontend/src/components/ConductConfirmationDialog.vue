<script setup>
    import { ref, watch } from 'vue';

    //Local Constants

    //Variables
    const props = defineProps(['wsqId']);
    const emits = defineEmits(['startConducting']);

    //Model Values
    const isButtonLoading = ref(false);

    //Built-in Functions

    //User-defined Functions
    const emitStartConducting = (willStartConducting) => {
        emits("startConducting", willStartConducting);
    }

    const checkIfWsqHasConducted = async() => {
        isButtonLoading.value = true;

        var data = {
            wsq_id: props.wsqId
        };
        
        const params = new URLSearchParams(data)
        var result = await axios.get(`/checkIfWsqHasConducted?${params}`);

        if(result.data.data == true){
            emitStartConducting(false);
        } else {
            emitStartConducting(true);
        }
    }
</script>

<template>
    <v-container>
        <v-row>
            <v-col
                cols="12"
            >
                <div class="d-flex justify-center">
                    <v-img
                        style="flex: 0 0 auto"
                        width="50%"
                        height="50%"
                        src="/computer_sthetoscope.png"
                        cover
                    >
                    </v-img>
                </div>
                <div class="text-center my-2">
                    <v-btn
                        class="font-weight-bold"
                        variant="elevated"
                        color="blue-lighten-1"            
                        prepend-icon="mdi-check-bold"
                        :loading="isButtonLoading"
                        @click="checkIfWsqHasConducted"
                    >
                        Start Conducting
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
</style>