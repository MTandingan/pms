<script setup>
    import { ref, watch, watchEffect, computed, nextTick, onMounted, onUnmounted} from 'vue';
    import { Chart, registerables } from 'chart.js';
    import ChartDataLabels from 'chartjs-plugin-datalabels';
    import { useUtilStore } from '@/stores/util';
    import Constants from "@/globals";

    Chart.register(...registerables, ChartDataLabels);   //Get only the specific chart NOT ALL the registerables, Do this later

    //Local Constants
    var options = {
        indexAxis: 'y',  // This makes the bar chart horizontal
        responsive: true,
        maintainAspectRatio: false,
        barPercentage: 0.8,
        categoryPercentage: 0.7,
        layout: {
            padding: {
                top: 10,
                bottom: 10
            }
        }
    };

    //Variables
    const utilStore = useUtilStore();
    const props = defineProps(['result', 'isActive']);
    let chartHardware = null;
    let chartSoftware = null;
    let resizeObserver = null;
    var stopWatchEffect = null;

    //Model Values
    const tab = ref(null);
    const chart_of_software = ref(null);
    const chart_of_hardware = ref(null);

    //Built-in Functions
    onMounted(() => {
        nextTick(() => {
            setTimeout(createCharts(), 0);

            resizeObserver = new ResizeObserver(() => {
                nextTick(createCharts);
            });

            if (chart_of_hardware.value) {
                resizeObserver.observe(chart_of_hardware.value);
            }

            if (chart_of_software.value) {
                resizeObserver.observe(chart_of_software.value);
            }
        });

        createCharts();
    });

    onUnmounted(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        if (chartHardware) {
            chartHardware.destroy();
        }

        if (chartSoftware) {
            chartSoftware.destroy();
        }
    });

    const result = computed(() => props.result ?? {});

    watch(chart_of_hardware, (newValue, oldValue) => {
        if (newValue) {
            nextTick(() => {
                createCharts();
            });
        }
    });

    watch(() => props.isActive, (newValue, oldValue) => {
        if(newValue){
            stopWatchEffect = watchEffect(() => {
                if (Object.keys(result.value).length !== 0) {
                    createCharts();
                }

                utilStore.setPageLoading({pIsPageLoading: false});
            });
        } else if(stopWatchEffect) {
            stopWatchEffect();
            stopWatchEffect = null;
        }
    });

    //User-defined Functions
    const createCharts = () => {
        if (Object.keys(result.value).length === 0) {
            return;
        }

        if(chartHardware){
            chartHardware.destroy();
        }

        if(chart_of_hardware.value != null && props.result.hardware.labels.length != 0){
            const ctx_hardware = chart_of_hardware.value.getContext("2d");

            chartHardware = new Chart(ctx_hardware, {
                type: 'bar',
                data: {
                    labels: props.result.hardware.labels,
                    datasets: [    
                        {
                            label: 'Ok',
                            data: props.result.hardware.Ok,
                            borderColor: "#42A5F5",
                            backgroundColor: "#42A5F5",
                        },
                        {
                            label: 'Defective',
                            data: props.result.hardware.Defective,
                            borderColor: "#2279a9",
                            backgroundColor: "#2279a9",
                        },
                        {
                            label: 'N/A',
                            data: props.result.hardware.Na,
                            borderColor: "#2279a9",
                            backgroundColor: "#2279a9",
                        }
                    ]
                },
                options: {
                    ...options,
                    plugins: {
                        datalabels: {
                            color: "#000",
                            anchor: 'center',
                            align: 'center',
                            font: {
                                weight: 'bold'
                            },
                            formatter: (value, context) => {
                                return value;
                            }
                        }
                    }
                }
            });
        }
        
        if(chartSoftware){
                chartSoftware.destroy();
        }

        if(chart_of_software.value != null && props.result.software.labels.length != 0){           
            const ctx_software = chart_of_software.value.getContext("2d");

            chartSoftware = new Chart(ctx_software, {
                type: 'bar',
                data: {
                    labels: props.result.software.labels,
                    datasets: [    
                        {
                            label: 'Ok',
                            data: props.result.software.Ok,
                            borderColor: "#42A5F5",
                            backgroundColor: "#42A5F5",
                        },
                        {
                            label: 'Defective',
                            data: props.result.software.Defective,
                            borderColor: "#45B4B4",
                            backgroundColor: "#45B4B4",
                        },
                        {
                            label: 'N/A',
                            data: props.result.software.Na,
                            borderColor: "#2279a9",
                            backgroundColor: "#2279a9",
                        }
                    ]
                },
                options: {
                    ...options,
                    plugins: {
                        datalabels: {
                            color: "#000",
                            anchor: 'center',
                            align: 'center',
                            font: {
                                weight: 'bold'
                            },
                            formatter: (value, context) => {
                                return value;
                            }
                        }
                    }
                }
            });
        }
    }

    const canvasHeightHardware = computed(() => {
        if(props.isActive == false){
            return 0;
        }

        if(Object.keys(result.value).length === 0){
            return 0
        }

        let totalHardwareItems = props.result.hardware.labels.length;
        let heightPerItem = 100;
        let minHeight = 800;

        return Math.max(totalHardwareItems * heightPerItem, minHeight);
    });

    const canvasHeightSoftware = computed(() => {
        if(props.isActive == false){
            return 0;
        }
        
        if(Object.keys(result.value).length === 0){
            return 0
        }

        let totalSoftwareItems = props.result.software.labels.length;
        let heightPerItem = 80;
        let minHeight = 800;

        return Math.max(totalSoftwareItems * heightPerItem, minHeight);
    });
</script>

<template>
        <v-row>
            <v-col
                cols="12"
            >
                <v-tabs
                    v-model="tab"
                    align-tabs="center"
                    bg-color="blue-lighten-5"
                >
                    <v-tab value="1">HARDWARE</v-tab>
                    <v-tab value="2">SOFTWARE</v-tab>
                </v-tabs>
                <v-tabs-window 
                    v-model="tab"
                >
                    <v-tabs-window-item
                        class="pa-4"
                        value="1"
                    >
                        <v-row>
                            <v-col
                                cols="12"
                            >
                                <v-sheet
                                    class="pa-4"
                                    elevation="4"   
                                    rounded="lg" 
                                    height="800"
                                >
                                    <canvas 
                                        ref="chart_of_hardware"
                                        :height="canvasHeightHardware"
                                    >
                                    </canvas>
                                </v-sheet>
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>
                    <v-tabs-window-item
                        class="pa-4"
                        value="2"
                    >
                        <v-row>
                            <v-col
                                cols="12"
                            >
                                <v-sheet
                                    class="pa-4"
                                    elevation="2"   
                                    rounded="lg" 
                                >
                                    <canvas 
                                        ref="chart_of_software"
                                        :height="canvasHeightSoftware"
                                    >
                                    </canvas>
                                </v-sheet>
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>
</template>

<style scoped>
</style>