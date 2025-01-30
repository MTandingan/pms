<script setup>
    import {ref, reactive} from 'vue'
    import PieChart from './PieChart.vue';

    const peripheralsData = reactive({
        Keyboard: { Ok: 80, Defective: 15, NA: 5 },
        Mouse: { Ok: 75, Defective: 20, NA: 5 },
        Monitor: { Ok: 70, Defective: 25, NA: 5 }
    });

</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-row justify="center">
                <v-col cols="12">
                    <v-divider></v-divider>
                </v-col>
                <v-col 
                    v-for="(data, peripheral) in peripheralsData" 
                    :key="peripheral" 
                    cols="12" lg="3" md="4" sm="6" xs="12"
                >
                    <v-sheet 
                        class="chart-container" elevation="2" rounded="lg"
                    >
                        <PieChart
                            :title="peripheral"
                            :data="data"
                        />
                    </v-sheet>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<style scoped>
    .chart-container {
        height: 350px;
        width: 100%;
    }
</style>