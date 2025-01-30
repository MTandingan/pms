<script setup>
import { ref, watch, watchEffect, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useUtilStore } from '@/stores/util';
import Constants from "@/globals";

// Register only the required components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title, ChartDataLabels);

// Local Constants

// Variables
const utilStore = useUtilStore();
const props = defineProps(['batch', 'result', 'isActive']);
const labels = ['Planned', 'Actual', 'Deferred'];
const options = {
    plugins: {
        legend: {
            labels: {
                generateLabels: function (chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                            const meta = chart.getDatasetMeta(0);
                            const style = meta.controller.getStyle(i);

                            return {
                                text: label,
                                fillStyle: style.backgroundColor,
                                strokeStyle: style.borderColor,
                                lineWidth: style.borderWidth,
                                hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                                index: i
                            };
                        });
                    }
                    return [];
                }
            },
            onClick: function (e, legendItem, legend) {
                const index = legendItem.index;
                const chart = legend.chart;
                const meta = chart.getDatasetMeta(0);

                const alreadyHidden = (meta.data[index].hidden === true);
                meta.data[index].hidden = !alreadyHidden;

                // Toggle the visibility
                chart.update();
            }
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = context.formattedValue;
                    return label + ': ' + value;
                }
            }
        }
    }
};
let stopWatchEffect = null;

// Model Values
const tab = ref(null);
const chart_of_canvas_quarter_1 = ref([]);
const chart_of_canvas_quarter_2 = ref([]);
const chart_of_canvas_quarter_3 = ref([]);
const chart_of_canvas_quarter_4 = ref([]);
const charts_quarter_1 = ref([]);
const charts_quarter_2 = ref([]);
const charts_quarter_3 = ref([]);
const charts_quarter_4 = ref([]);
const month_1 = ref("Month 1");
const month_2 = ref("Month 2");
const month_3 = ref("Month 3");
const month_4 = ref("Month 4");

// Built-in Functions
onMounted(() => {
    createCharts();
});

onUnmounted(() => {
    destroyCharts();
});

const result = computed(() => props.result ?? {});

watch(() => props.isActive, (newValue, oldValue) => {
    if (newValue) {
        stopWatchEffect = watchEffect(() => {
            if (Object.keys(result.value).length !== 0) {
                createCharts();
            }

            utilStore.setPageLoading({ pIsPageLoading: false });
        });
    } else if (stopWatchEffect) {
        stopWatchEffect();
        stopWatchEffect = null;
    }
});

watch(() => props.batch, (newValue, oldValue) => {
    switch (Number(newValue)) {
        case Constants.BATCH_1: {
            month_1.value = "January";
            month_2.value = "April";
            month_3.value = "July";
            month_4.value = "October";
        } break;
        case Constants.BATCH_2: {
            month_1.value = "February";
            month_2.value = "May";
            month_3.value = "August";
            month_4.value = "November";
        } break;
        case Constants.BATCH_3: {
            month_1.value = "March";
            month_2.value = "June";
            month_3.value = "September";
            month_4.value = "December";
        } break;
    }
});

// User-defined Functions
const createCharts = () => {
    destroyCharts();
    if (Object.keys(result.value).length === 0) {
        return;
    }

    createQuarterCharts(props.result.quarter1, chart_of_canvas_quarter_1, charts_quarter_1);
    createQuarterCharts(props.result.quarter2, chart_of_canvas_quarter_2, charts_quarter_2);
    createQuarterCharts(props.result.quarter3, chart_of_canvas_quarter_3, charts_quarter_3);
    createQuarterCharts(props.result.quarter4, chart_of_canvas_quarter_4, charts_quarter_4);
};

const destroyCharts = () => {
    charts_quarter_1.value.forEach(chart => chart?.destroy());
    charts_quarter_2.value.forEach(chart => chart?.destroy());
    charts_quarter_3.value.forEach(chart => chart?.destroy());
    charts_quarter_4.value.forEach(chart => chart?.destroy());
    charts_quarter_1.value = [];
    charts_quarter_2.value = [];
    charts_quarter_3.value = [];
    charts_quarter_4.value = [];
};

const createQuarterCharts = async(quarterData, canvasRefs, chartRefs) => {

    chartRefs.value.forEach(chart => chart?.destroy());
    chartRefs.value = [];

    await nextTick();

    quarterData.forEach((item, index) => {
        const ctx = canvasRefs.value[index];
        if (ctx) {
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        backgroundColor: ['#45B4B4', '#42A5F5', '#2279a9'],
                        data: [item.quarter_numPlanned, item.quarter_numActual, item.quarter_numDeferred]
                    }]
                },
                options: {
                    ...options,
                    responsive: true,
                    maintainAspectRatio: true,
                    layout: {
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    plugins: {
                        ...options.plugins,
                        title: {
                            display: true,
                            text: `${item.location_name}`,
                            font: {
                                size: (ctx) => {
                                    return Math.min(16, ctx.chart.width / 20);
                                },
                                weight: 'bold'
                            },
                            color: '#333',
                            padding: {
                                top: 5,
                                bottom: 5
                            }
                        },
                        datalabels: {
                            color: "#000",
                            anchor: 'center',
                            align: 'center',                            
                            font: {
                                size: "14",
                                weight: 'bold'
                            },
                            formatter: (value, context) => {
                                return value;
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
            chartRefs.value.push(chart);
        }
    });
};
</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-tabs v-model="tab" align-tabs="center" bg-color="blue-lighten-5">
                <v-tab v-for="(month, index) in [month_1, month_2, month_3, month_4]" :key="index" :value="(index + 1).toString()" :color="tab === (index + 1).toString() ? 'primary' : undefined">
                    {{ month }}
                </v-tab>
            </v-tabs>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item class="pa-4" value="1">
                    <v-row justify="center">
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        <v-col v-for="(item, index) in result.quarter1" :key="index" cols="12" lg="3" md="4" sm="6" xs="12">
                            <v-sheet class="pa-4 chart-container" elevation="2" rounded="lg">
                                <canvas v-if="result.quarter1.length > 0" :ref="el => { if(el) chart_of_canvas_quarter_1[index] = el }"></canvas>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </v-tabs-window-item>
                <v-tabs-window-item class="pa-4" value="2">
                    <v-row justify="center">
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        <v-col v-for="(item, index) in result.quarter2" :key="index" cols="12" lg="3" md="4" sm="6" xs="12">
                            <v-sheet class="pa-4 chart-container" elevation="2" rounded="lg">
                                <canvas v-if="result.quarter2.length > 0" :ref="el => { if(el) chart_of_canvas_quarter_2[index] = el }"></canvas>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </v-tabs-window-item>
                <v-tabs-window-item class="pa-4" value="3">
                    <v-row justify="center">
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        <v-col v-for="(item, index) in result.quarter3" :key="index" cols="12" lg="3" md="4" sm="6" xs="12">
                            <v-sheet class="pa-4 chart-container" elevation="2" rounded="lg">
                                <canvas v-if="result.quarter3.length > 0" :ref="el => { if(el) chart_of_canvas_quarter_3[index] = el }"></canvas>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </v-tabs-window-item>
                <v-tabs-window-item class="pa-4" value="4">
                    <v-row justify="center">
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        <v-col v-for="(item, index) in result.quarter4" :key="index" cols="12" lg="3" md="4" sm="6" xs="12">
                            <v-sheet class="pa-4 chart-container" elevation="2" rounded="lg">
                                <canvas v-if="result.quarter4.length > 0" :ref="el => { if(el) chart_of_canvas_quarter_4[index] = el }"></canvas>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-col>
    </v-row>
</template>


<style scoped>
    .chart-container {
        height: 450px;
        width: 100%;
    }
</style>