\title{Sample LaTeX Page}
\author{Your Name}
\date{\today}

This is a sample LaTeX page that demonstrates various mathematical expressions and formatting capabilities.

\section{Basic Math Examples}

Here's an example of inline math: $f(x) = x^2 + 2x + 1$ within text.

Here's a displayed equation:

$$E = mc^2$$

A more complex equation with alignment:

$$
\begin{aligned}
\frac{d}{dx}e^x &= e^x \\
\frac{d}{dx}\ln(x) &= \frac{1}{x} \\
\frac{d}{dx}\sin(x) &= \cos(x)
\end{aligned}
$$

\section{Theorem Example}

\begin{theorem}
For any right triangle with sides $a$, $b$, and hypotenuse $c$:
$$a^2 + b^2 = c^2$$
\end{theorem}

\begin{proof}
This is Pythagoras' theorem. The proof involves showing that the area of squares constructed on the two legs equals the area of the square on the hypotenuse.
\end{proof}

\section{Matrix Operations}

Here's a matrix equation:

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix} =
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

\section{Calculus Examples}

The definition of a derivative:

$$\lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$

A double integral:

$$\iint_D f(x,y) \,dx\,dy = \int_a^b\int_c^d f(x,y) \,dy\,dx$$

\section{Statistics}

The normal distribution probability density function:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

\section{Complex Numbers}

Euler's famous identity:

$$e^{i\pi} + 1 = 0$$

\section{Series}

The sum of a geometric series:

$$\sum_{n=0}^{\infty} ar^n = \frac{a}{1-r}, \quad |r| < 1$$

\section{Physics}

The Schrödinger equation:

$$i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi$$

Note: All equations are rendered using KaTeX in the browser. Some advanced LaTeX features might not be supported by KaTeX.
