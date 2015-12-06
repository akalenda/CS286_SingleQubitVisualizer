define([
    'jquery'
], function ($) {
    'use strict';

    var module = angular.module('ADTDeltaProject', []);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['ADTDeltaProject']);
    });

    /**
     *
     */
    module.controller('Controller', function ControllerConstructor() {

        var that = this;
        var stateInStandardBasis = {
            x: Math.sqrt(0.5),
            y: Math.sqrt(0.5)
        };

        /* *************************** Angular fields *******************************************/
        this.stateVec = "\\sqrt{1/2} |u> + \\sqrt{1/2} |v>";
        this.basisVec = "|0>";
        this.mathjax_x = "";
        this.mathjax_u = "";
        this.mathjax_v = "";

        /* *************************** Angular button functions **************************************************/
        this.stateUpdated = this.basisUpdated = function basisUpdated() {
            /*var probAmpS = extractProbabilityAmplitudes(that.stateVec, '|u>', '|v>');
            var probAmpB = extractProbabilityAmplitudes(that.basisVec, '|0>', '|1>');
            var probAmpP = getVectorPerpendicularTo(probAmpB);
            stateInStandardBasis.x = probAmpS.x * probAmpB.x + probAmpS.y * probAmpP.x;
            stateInStandardBasis.y = probAmpS.x * probAmpB.y + probAmpS.y * probAmpP.y;*/
            // TODO: Uncomment preceding. Remove this test bit:
            stateInStandardBasis = {x: 0.707, y: 0.707};
            redrawGraph();
        };

        /* *************************** Initialize Chart **************************************/
        var data = [{
            r: [],
            t: [],
            mode: 'lines',
            name: 'Probability Amplitude',
            marker: {
                color: 'none',
                line: {color: 'blue',
                    shape: 'spline',
                    dash: 'dot',
                    smoothing: 1,
                    width: 2
                }
            },
            type: 'scatter'
        }, {
            r: [],
            t: [],
            mode: 'lines',
            name: 'Probability',
            marker: {
                color: 'none',
                line: {color: 'orange',
                    shape: 'spline',
                    smoothing: 1,
                    width: 3
                }
            },
            type: 'scatter'
        }];

        var layout = {
            font: {
                family: 'Arial, sans-serif;',
                size: 18,
                color: '#000'
            },
            showlegend: false,
            width: 800,
            height: 800,
            margin: {
                l: 40,
                r: 40,
                b: 20,
                t: 20,
                pad: 0
            },
            paper_bgcolor: '#eeeecc',
            plot_bgcolor: '#eeeecc',
            orientation: 0,
            radialaxis: {
                range: [0, 1],
                orientation: 180-45
            },
            angularaxis: {
                range: [360, 0]
            }
        };

        Plotly.newPlot('polarChart', data, layout);
        this.stateUpdated();

        /* ************************* Helper functions **********************************/

        function extractProbabilityAmplitudes(parseVector, basisVector, perpVector) {
            var firstSplit = parseVector.split(basisVector); // TODO: Built-in standard and plus-minus basis
            var probAmp0 = firstSplit[0];
            var secondSplit = firstSplit[1].split(perpVector);
            var probAmp1 = secondSplit[0];
            return {
                x: parseIntFrom(probAmp0),
                y: parseIntFrom(probAmp1)
            }
        }

        function parseIntFrom(latex) {
            var evaluation = MathLex.render(MathLex.parse(latex), 'sage');
            return evaluation == "" ? 1 : parseInt(evaluation);
        }

        function getVectorPerpendicularTo(u) {
            return {
                x: Math.cos(Math.acos(u.x) + 180),
                y: Math.sin(Math.asin(u.y) + 180)
            };
        }

        function redrawGraph() {
            data[0].r = [];
            data[0].t = [];
            data[1].r = [];
            data[1].t = [];
            for (var theta = 0; theta <= 360; theta += 5) {
                var probAmp = getProbabilityAmplitudeOfMeasurementAt(theta);
                data[0].t.push(theta);
                data[1].t.push(theta);
                data[0].r.push(probAmp);
                data[1].r.push(probAmp * probAmp);
            }
            // Because Plotly sucks and can't redraw polar charts worth a crap.
            $('#polarChart').remove();
            $('<div id="polarChart"></div>').insertAfter('#insertionPoint');
            Plotly.newPlot('polarChart', data, layout);
        }

        function getProbabilityAmplitudeOfMeasurementAt(theta) {
            return innerProductOf(stateInStandardBasis, angleToVector(theta));
        }

        function innerProductOf(a, b) {
            return a.x * b.x + a.y * b.y;
        }

        function angleToVector(theta) {
            var radians = theta * 0.0174533;
            return {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
        }
    });
});