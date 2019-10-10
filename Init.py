# -*- coding: utf-8 -*-


#Mostly just test code right now, creates a collection local mongodb

# required packages (thus far!)
# pip install pymongo
# pip install node
# npm install express
# npm install mongodb
# npm install xmlhttprequest (this is for testing serverside while not in browser, won't be required for live)

import pymongo

testPosts = [
    {
        'title': "Walden, and On The Duty Of Civil Disobedience",
        'author': "Evan",
        'published': 1570657113,
        'body': "I should not obtrude my affairs so much on the notice of my readers if very particular inquiries had not been made by my townsmen concerning my mode of life, which some would call impertinent, though they do not appear to me at all impertinent, but, considering the circumstances, very natural and pertinent. Some have asked what I got to eat; if I did not feel lonesome; if I was not afraid; and the like. Others have been curious to learn what portion of my income I devoted to charitable purposes; and some, who have large families, how many poor children I maintained. I will therefore ask those of my readers who feel no particular interest in me to pardon me if I undertake to answer some of these questions in this book. In most books, the I, or first person, is omitted; in this it will be retained; that, in respect to egotism, is the main difference. We commonly do not remember that it is, after all, always the first person that is speaking. I should not talk so much about myself if there were anybody else whom I knew as well. Unfortunately, I am confined to this theme by the narrowness of my experience. Moreover, I, on my side, require of every writer, first or last, a simple and sincere account of his own life, and not merely what he has heard of other men’s lives; some such account as he would send to his kindred from a distant land; for if he has lived sincerely, it must have been in a distant land to me. Perhaps these pages are more particularly addressed to poor students. As for the rest of my readers, they will accept such portions as apply to them. I trust that none will stretch the seams in putting on the coat, for it may do good service to him whom it fits."
    },

    {
        'title': "Moby Dick",
        'author': "Evan",
        'published': 1570647113,
        'body': "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time tozz get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me."
    },

    {
        'title': "Potrait of Dorian Gray",
        'author': "Evan",
        'published': 1570447112,
        'body': """From the corner of the divan of Persian saddle-bags on which he was lying, smoking, as was his custom, innumerable cigarettes, Lord Henry Wotton could just catch the gleam of the honey-sweet and honey-coloured blossoms of a laburnum, whose tremulous branches seemed hardly able to bear the burden of a beauty so flamelike as theirs; and now and then the fantastic shadows of birds in flight flitted across the long tussore-silk curtains that were stretched in front of the huge window, producing a kind of momentary Japanese effect, and making him think of those pallid, jade-faced painters of Tokyo who, through the medium of an art that is necessarily immobile, seek to convey the sense of swiftness and motion. The sullen murmur of the bees shouldering their way through the long unmown grass, or circling with monotonous insistence round the dusty gilt horns of the straggling woodbine, seemed to make the stillness more oppressive. The dim roar of London was like the bourdon note of a distant organ."""
    },
    {
        'title': "The Stranger",
        'author': "Evan",
        'published': 11111,
        'body': """Mother died today. Or maybe yesterday, I don’t know. I had a telegram from the home: ‘Mother passed away. Funeral tomorrow. Yours sincerely.’ That doesn’t mean anything. It may have been yesterday."""
    },
    {
        'title': "Metamorphosis",
        'author': "Evan",
        'published': 1123123123,
        'body': """As Gregor Samsa awoke one morning from uneasy dreams he found himself transformed in his bed into a gigantic insect. He was lying on his hard, as it were armor-plated, back and when he lifted his head a little he could see his dome-like brown belly divided into stiff arched segments on top of which the bed quilt could hardly keep in position and was about to slide off completely. His numerous legs, which were pitifully thin compared to the rest of his bulk, waved helplessly before his eyes.

"""},
    {
        'title': "Norwegian Wood",
        'author': "Evan",
        'published': 43453453451,
        'body': """I was 37 then, strapped in my seat as the huge 747 plunged through dense cloud cover on approach to Hamburg Airport. Cold November rains drenched the earth. lending everything the gloomy air of a Flemish landscape: the ground crew in waterproofs, a flag atop a squat building, a BMW billboard. So - Germany again.

"""},
    {
        'title': "The Catcher In The Rye",
        'author': "Evan",
        'published': 3453453453454351,
        'body': """If you really want to hear about it, the first thing you’ll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don’t feel like going into it, if you want to know the truth"""},
]


client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["testdb"]
collection = db["posts"]

for post in testPosts:
    print(post)
    collection.insert(post)
