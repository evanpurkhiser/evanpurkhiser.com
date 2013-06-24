---
layout: page
---

# Lets try some things

This is a test of the Jeklly redcarpet markdown parser. In this post post I'm
going to try and use all of the different features of the redcarpet MD parser.

First and foremost, let's start off with a code block using the 'fenced' block
style.

````ruby
class A < B; def self.create(object = User) object end end
class Zebra; def inspect; "X#{2 + self.object_id}" end end

module ABC::DEF
  include Comparable

  # @param test
  # @return [String] nothing
  def foo(test)
    Thread.new do |blockvar|
      ABC::DEF.reverse(:a_symbol, :'a symbol', :<=>, 'test' + test)
    end.join
  end

  def [](index) self[index] end
  def ==(other) other == self end
end

anIdentifier = an_identifier
Constant = 1
render action: :new
````

With any luck that should look real nice and pretty. We should also be able to
use show code blocks using the older indent MD style like so


	/**
	 * Number of seconds in a minute, incrementing by a step. Typically used as
	 * a shortcut for generating a list that can used in a form.
	 *
	 *     $seconds = Date::seconds(); // 01, 02, 03, ..., 58, 59, 60
	 *
	 * @param   integer $step   amount to increment each step by, 1 to 30
	 * @param   integer $start  start value
	 * @param   integer $end    end value
	 * @return  array   A mirrored (foo => foo) array from 1-60.
	 */
	public static function seconds($step = 1, $start = 0, $end = 60)
	{
		// Always integer
		$step = (int) $step;

		$seconds = array();

		for ($i = $start; $i < $end; $i += $step)
		{
			$seconds[$i] = sprintf('%02d', $i);
		}

		return $seconds;
	}

Small little code snippets should also look nice when they are shown using
single back ticks. For example, in PHP you can describe methods like
`ClassName::method_name`, neat.

# Typographic features

## Lists and the the such

Let's try some other things, here's a few examples of lists.

 1. Numbered lists are a great way to show content in a ordered fashion! For
    example, maybe I want to instruct you on how to cook something?
 2. Step two is an important one, yep.
 3. And finally step three.

It's possible that adding spaces between the un-numbered list may make things
slightly different. Let's take a look

 1. Numbered lists are a great way to show content in a ordered fashion! For
    example, maybe I want to instruct you on how to cook something?

 2. Step two is an important one, yep.

 3. And finally step three.

Now for some un-ordered list...

 * This is an element in the un-ordered list. How's it looking?
 * Another element
 * One more..
 * And while where at it lets finish off with a nice even amount

Once more let's see if spacing has any sort of effect

 * This is an element in the un-ordered list. How's it looking?

 * Another element

 * One more..

 * And while where at it lets finish off with a nice even amount

## Block quotes

Here's what a block quote s

> I am not the only person who uses his computer mainly for the purpose of
> diddling with his computer.
>
> <cite>– Dave Barry</cite>

## Other generic things

Let's say I want to yell about something, I could use CAPS. Or I could make it
**bold** for emphasis. I could also use _italics_ when I want to be sarcastic
about something. But it's not like I like to or anything, _baka_!

Links are also always good. Here's a link to my favorite git hosting website,
[GitHub](http://github.com)! Ofcourse, I don't _have_ to use the special
markdown format for links. I can always just have them be auto-linked

http://nestacms.com/docs/creating-content/markdown-cheat-sheet

One can hope it might also work for emails, like mine: evanpurkhiser@gmail.com

Some other neat features that the redcarpet markdown parser offers are things
line ~~strike through~~ and super escripts, for example n^2 or n^(2*5)

## Tables

Another neat thing that redcarpet can do is tables righti n markdown!

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |

## Images

Finally we can make images.. With some fancy CSS trickery we can evern show the
alt of the image as a caption!

![I really just wanted a cool looking image. Shimmamuras Max album will have
to do](http://www.djshimamura.com/dynasty/dncd007/head2.jpg)

---

Horizontal rulers are also a nice way to separate out content. That's all for
now. This page mainly serves as a way for me to test all of the different MD
elements and style them to my linkings!
