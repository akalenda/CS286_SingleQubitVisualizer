define([
    'jquery'
], function ($) {
    'use strict';

    var module = angular.module('ADTDeltaProject', []);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['ADTDeltaProject']);
    });

    module.directive("mathjaxBind", function() {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs",
                function($scope, $element, $attrs) {
                    $scope.$watch($attrs.mathjaxBind, function(texExpression) {
                        var texScript = angular.element("<script type='math/tex'>")
                            .html(texExpression ? texExpression :  "");
                        $element.html("");
                        $element.append(texScript);
                        MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    });
                }]
        };
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
        this.stateVec = "sqrt(1/2) |u> + sqrt(1/2) |v>";
        this.basisVec = "|0>";
        this.mathjax_x = "";
        this.mathjax_xStandard = "";
        this.mathjax_u = "";
        this.mathjax_v = "";

        /* *************************** Angular button functions **************************************************/
        this.stateUpdated = this.basisUpdated = function basisUpdated() {
            var probAmpS = extractProbabilityAmplitudes(that.stateVec, '|u>', '|v>');
            var probAmpU = extractProbabilityAmplitudes(that.basisVec, '|0>', '|1>');
            var probAmpV = getVectorPerpendicularTo(probAmpU);
            stateInStandardBasis.x = (probAmpS.x * probAmpU.x) + (probAmpS.y * probAmpV.x);
            stateInStandardBasis.y = (probAmpS.x * probAmpU.y) + (probAmpS.y * probAmpV.y);
            redrawGraph();
            that.mathjax_x         = toLatex(probAmpS, "|x\\rangle=", "|u\\rangle", "|v\\rangle");
            that.mathjax_xStandard = toLatex(stateInStandardBasis, "|x\\rangle\\approx", "|0\\rangle", "|1\\rangle");
            that.mathjax_u         = toLatex(probAmpU, "|u\\rangle=", "|0\\rangle", "|1\\rangle");
            that.mathjax_v         = toLatex(probAmpV, "|v\\rangle\\approx", "|0\\rangle", "|1\\rangle");
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

        /* ************************* Helper functions **********************************/

        function extractProbabilityAmplitudes(parseVector, basisVector, perpVector) {
            var firstSplit = parseVector.split(basisVector); // TODO: Built-in standard and plus-minus basis
            var probAmp0 = firstSplit[0];
            var secondSplit = (firstSplit[1] ? firstSplit[1] : parseVector).split(perpVector);
            var probAmp1 = secondSplit[0];
            function toMathLex(split, probAmp) {
                if (split.length == 1)
                    return "0";
                if (probAmp === "")
                    return "1";
                return MathLex.parse(probAmp);
            }
            var probAmp0mathlex = toMathLex(firstSplit, probAmp0);
            var probAmp1mathlex = toMathLex(secondSplit, probAmp1);
            return {
                x: evaluateMathLex(probAmp0mathlex),
                y: evaluateMathLex(probAmp1mathlex),
                xLex: probAmp0mathlex,
                yLex: probAmp1mathlex
            };
        }

        function getVectorPerpendicularTo(u) {
            var offset = radiansFromDegrees(90);
            return {
                x: Math.cos(Math.acos(u.x) + offset),
                y: Math.sin(Math.asin(u.y) + offset)
            };
        }

        function redrawGraph() {
            data[0].r = [];
            data[0].t = [];
            data[1].r = [];
            data[1].t = [];
            for (var theta = 0; theta <= 360; theta += 3) {
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
            var radians = radiansFromDegrees(theta);
            return {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
        }

        function radiansFromDegrees(deg) {
            return deg * 0.0174533;
        }

        function toLatex(vector, leftSideOfEquation, basisU, basisV) {
            var coeffU = (vector.xLex && !$.isNumeric(vector.xLex)) ? MathLex.render(vector.xLex, "latex") : approximateToZeroOrOne(vector.x);
            var coeffV = (vector.yLex && !$.isNumeric(vector.yLex)) ? MathLex.render(vector.yLex, "latex") : approximateToZeroOrOne(vector.y);
            return leftSideOfEquation + coeffU + " " + basisU + " + " + coeffV + " " + basisV;
        }

        function approximateToZeroOrOne(number) {
            if (Math.abs(number - 0) < 0.000001)
                return 0;
            if (Math.abs(number - 1) < 0.000001)
                return 1;
            if (Math.abs(number + 1) < 0.000001)
                return -1;
            return number;
        }

        /* *************************** LaTex parsing ************************************************/
        var jsFuncFor = {
            sqrt    : function sqrt    (x)  { return Math.sqrt(x);  },
            sin     : function sin     (x)  { return Math.sin(x);  },
            cos     : function cos     (x)  { return Math.cos(x);  },
            Variable: function Variable(x)  { return x; },
            Function: function Function(x,y){ return jsFuncFor[x](y); },
            Literal : function Literal (x,y){ return y;  },
            Plus    : function Plus    (x,y){ return x + y;  },
            Minus   : function Minus   (x,y){ return x - y;  },
            Positive: function Positive(x)  { return x; },
            Negative: function Negative(x)  { return -x;  },
            Times   : function Times   (x,y){ return x * y;  },
            Divide  : function Divide  (x,y){ return x / y;  }
        };

        function evaluateMathLex(mathlex) {
            if ($.isArray(mathlex[0]))
                mathlex = mathlex[0];
            var f = jsFuncFor[mathlex[0]];
            if (!f)
                return mathlex;
            var x = mathlex[1] ? evaluateMathLex(mathlex[1]) : null;
            var y = mathlex[2] ? evaluateMathLex(mathlex[2]) : null;
            return f(x,y);
        }


        /* *************************** After everything's ready, initialize ************************/
        this.stateUpdated();
    });
});