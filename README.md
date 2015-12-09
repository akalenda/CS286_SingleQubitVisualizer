# CS286_SingleQubitVisualizer

A simple application I was tinkering with for my Quantum Computation class, used to reason about a single qubit.

## What is it written in?

Javascript and HTML5/CSS. Libraries used include Angular JS, Plotly, Bootstrap, MathLex, and RequireJS.

## How do I run it?

Clone the repository to your computer, and then open index.html in a modern web browser. (I use Chrome.)

## What does it do?

1. User enters a state vector, |u>, in terms of |0> and |1> (the standard basis)
2. Program calculates |v>, a vector perpendicular to |u>
3. User enters a state vector, |x>, in terms of |u> and |v>
4. Program recalculates |x> in terms of the standard basis
5. Program plots the graph. For each angle, 0-360 degrees, is a corresponding measurement vector, |m>,
   which together with a perpendicular vector |p> (assumed to be 90 degrees widdershins) forms
   a basis. A state measured in the basis has so much probability of its measurement corresponding
   to <m> or <p>. The r-value of the polar graph corresponds to that probability on the orange curve,
   and its probability amplitude (sans imaginary component) on the dotted blue curve.
6. Program posts MathJax (which is similar to LaTex) for |x>, |u>, |v>

## What issues are there?

Plotly doesn't work well; we should just forego the library and draw stuff ourselves. It doesn't
handle imaginary numbers in the probability amplitudes. It only works for a single qubit, 
which isn't very interesting. Also, any labels should be in radians rather than degrees, which
is another Plotly issue.

## How could we handle imaginary numbers?

The imaginary component is continuous, but bounded between -i and i (inclusive). We could use RGB
color to represent the state. At 100% real, e.g. k(1 + 0i), the curve is colored blue; at 100% 
imaginary, e.g. k(0 + 1i), the curve is colored green; at 50% real and imaginary, e.g. k(0.5 + 0.5i),
the curve is colored yellow. Thus as the coefficients phase from real to imaginary, the colors
phase from blue to green.

## How could we handle multiple qubits?

We may not be able to. One thing that I did note is that, due to the nature of the curves, there is
no confusing visual overlap between a curve at theta t with an r>=0, and the same curve at
(t+180) with an r<=0. (To see what I mean by confusing visual overlap, play with [this link](1)).

Thus if we have a way to wrap all the possible states of two qubits in a circular fashion, we 
could chart a state without visual confusion. Perhaps one way of doing it would be like so,
moving a total of 360 degrees widdershins:

    |+0+0>, |+0+1>, |+0-0>, |+0-1>,
    |+1-1>, |+1+0>, |+1+1>, |+1-0>,
    |-0-0>, |-0-1>, |-0+0>, |-0+1>,
    |-1+1>, |-1-0>, |-1-1>, |-1+0>
    
Conceptually, t's not unlike switching from a clock with two hands (hour and minute) to a clock
with a single hand (hour*60 + minute). I expect that if this scheme works with a two-qubit
system, it could extend to any number of qubits.

You may note that it first cycles through the second qubit and then the first, when it could
just as easily cycle through the first and then the second. The feature could be extended by
being able to switch the plot between those two cycle patterns, giving a different shape...
which would show a different curve, and perhaps even give different insights.
    
Some pairs of angles on the graph will duplicate the same state vector, but this is acceptable.
More importantly the transitions from one state to the next would be continuous. I have also
visually confirmed that in this scheme, opposing states would appear across from one another
on the graph (e.g. |+0-1> and |-0+1> are 180 degrees from one another).

## Are there any other improvements that could be made?

First:

Logic that displays an error if a state is somehow invalid (i.e. coefficients are not
normalized).

Second:

At the bottom of the page, a matrix representation of |x> in the standard basis
on the right side of the frame. Above that, buttons for I,X,Z,H. These buttons each
add an n-by-n grid of input fields, where n is the number of qubits in the system.
This grid is the matrix for a logic gate acting on the system, filled out according
to whichever preset matrix was clicked. The values can then of course be tweaked.
The transformation is then applied to |x>, and the graph updated accordingly. Users 
can continue to click the button and add more transformations.

Third:

Plenty of other things, I have no doubt!

## Future of the project

It'd be fun to continue, but I am unlikely to do so without exigencies.

[1]: https://www.desmos.com/calculator/0ovfwwmfrb
