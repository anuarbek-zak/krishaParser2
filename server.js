var express = require('express');
var cheerio = require("cheerio");
var URL = "https://krisha.kz";
var async = require('async');
var needle = require('needle');
var csv = require('csv');
var csv_obj = csv();

function getTitle($){
	return $("h1").text()
}

function getPrice($,cb){
	$(".a-header").find('span').each(function(){
					// ! check regex for price
					if(($(this).attr('class')).match('[Pp]rice'))	cb(parseInt($(this).text().replace(/\s/g, '')));
				})
}

function getRegion($,cb){
	$('.main-col>div,a-item>div').each(function(){
							// ! check regex for region
		if(($(this).attr('class')).match('[Ww]here|[Rr]egion')) cb($(this).text())
	})
}

function getDescription($,cb){
	cb($('.main-col .text').text())
}

var links = [];
var flats = [];

needle.get(URL+"/prodazha/kvartiry/", function (err, res) {
	if (err) throw err;
	var $ = cheerio.load(res.body);
	$(".a-card").each(function () {
		var link = $(this).find('.a-card__title').attr('href');
		links.push(link);
	});
	async.each(
		links,
		function (item,callback) {
			needle.get(URL+item,function (err, resik) {
				if (err) throw err;
				var $ = cheerio.load(resik.body);
				var flat = [];
				flat.push(URL+item);
				flat.push(getTitle($));
				getPrice($,function(result){
					flat.push(result)
				});
				getRegion($,function(result){
					flat.push(result)
				})
				getDescription($,function(result){
					flat.push(result)
				})
				flats.push(flat)
				callback();
			});
		},
		function (err) {
			if(err) throw err;
			flats.unshift(['link','title','price','region','description'])
			console.log(flats);
			csv_obj.from.array(flats).to.path('dataInfo.csv')
		});
});
