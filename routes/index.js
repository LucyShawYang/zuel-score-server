const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const { TeacherModel, CourseModel, LikeModel, DislikeModel, ScoreModel } = require("../db/models");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//获取课程列表
router.get("/course", verifyToken, function (req, res, next) {
  let { sort_option } = req.query;
  console.log("-----------", sort_option)
  // 默认情况下按照课程名升序排序
  if (!sort_option) {
    console.log("Hi")
    CourseModel.find().sort("course_name").collation({ locale: "zh" }).exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
  // 按平均分降序排列
  else if (sort_option === "desc_average") {
    CourseModel.find().sort("-average").exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
  // 按平均分升序排列
  else if (sort_option === "asc_average") {
    CourseModel.find().sort("average").exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
  // 按优秀率降序排列
  else if (sort_option === "desc_above90") {
    CourseModel.find().sort('-above90').exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
  // 按优秀率升序排列
  else if (sort_option === "asc_above90") {
    CourseModel.find().sort('above90').exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
  else if (sort_option === "desc_between80_90") {
    CourseModel.find().sort('-between80_90').exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
  else if (sort_option === "asc_between80_90") {
    CourseModel.find().sort('between80_90').exec(function (err, courses) {
      if (err) {
        res.send({ code: 1, msg: err });
      }
      else {
        res.send({ code: 0, data: courses });
      }
    })
  }
});

// 获取课程详情
router.get("/course/detail", verifyToken, function (req, res, next) {
  const { course_name, teacher_name } = req.query;
  CourseModel.findOne({ course_name: course_name, teacher_name: teacher_name }, function (err, course) {
    res.send({ code: 0, data: course });
  })
});

// 获取课程点赞与否
router.get("/course/like", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const course_id = req.query.course_id;
  LikeModel.findOne({ openid: openid, course_id: course_id }, function (err, like) {
    if (!err) {
      let islike;
      if (like) {
        islike = like.islike;
      }
      else {
        islike = false;
      }
      LikeModel.where({ course_id: course_id, islike: true }).count(function (err, cnt) {
        res.send({
          code: 0, data: {
            islike: islike,
            like_count: cnt
          }
        });
        console.log("cnt:", cnt);
      })
    }
  });
});
// 获取课程不喜欢与否
router.get("/course/dislike", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const course_id = req.query.course_id;
  DislikeModel.findOne({ openid: openid, course_id: course_id }, function (err, dislike) {
    if (!err) {
      let isdislike;
      if (dislike) {
        isdislike = dislike.isdislike;
      }
      else {
        isdislike = false;
      }
      DislikeModel.where({ course_id: course_id, isdislike: true }).count(function (err, cnt) {
        res.send({
          code: 0, data: {
            isdislike: isdislike,
            dislike_count: cnt
          }
        });
      })
    }
  });
});

// 点赞课程
router.get("/course/clicklike", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const course_id = req.query.course_id;
  LikeModel.findOne({ openid: openid, course_id: course_id }, function (err, like) {
    if (!like) {
      new LikeModel({ openid: openid, course_id: course_id, islike: true }).save(function (err, doc) {
        res.send({ code: 0, data: doc });
      });
    }
    else {
      LikeModel.updateOne({ openid: openid, course_id: course_id }, { islike: true }, function (err, doc) {
        res.send({ code: 0, data: doc });
        console.log(doc);
      });
    }
  })
});
// 取消点赞课程
router.get("/course/cancellike", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const course_id = req.query.course_id;
  LikeModel.findOne({ openid: openid, course_id: course_id }, function (err, like) {
    LikeModel.updateOne({ openid: openid, course_id: course_id }, { islike: false }, function (err, doc) {
      res.send({ code: 0, data: doc });
      console.log(doc);
    });
  })
});
// 不喜欢课程
router.get("/course/clickdislike", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const course_id = req.query.course_id;
  DislikeModel.findOne({ openid: openid, course_id: course_id }, function (err, dislike) {
    if (!dislike) {
      new DislikeModel({ openid: openid, course_id: course_id, isdislike: true }).save(function (err, doc) {
        res.send({ code: 0, data: doc });
        console.log(doc);
      });
    }
    else {
      DislikeModel.updateOne({ _id: dislike._id }, { isdislike: true }, function (err, doc) {
        console.log(doc);
        res.send({ code: 0, data: doc });
      });
    }
  })
});
// 取消不喜欢课程
router.get("/course/canceldislike", verifyToken, function (req, res, next) {
  const openid = req.payload.openid;
  const course_id = req.query.course_id;
  DislikeModel.findOne({ openid: openid, course_id: course_id }, function (err, dislike) {
    DislikeModel.updateOne({ _id: dislike._id }, { isdislike: false }, function (err, doc) {
      res.send({ code: 0, data: doc });
      console.log(doc);
    });
  })
});
// 获取课程得分
router.get("/course/score", verifyToken, function (req, res, next) {
  const course_id = req.query.course_id;
  const openid = req.payload.openid;
  ScoreModel.findOne({ course_id, openid }, function (err, score) {
    if (score) {
      res.send({ code: 0, data: score });
    }
    else {
      let score = {
        score: {
          first: "0",
          second: "0"
        }
      }
      res.send({ code: 0, data: score });
    }
  });
});

// 获取老师列表
router.get("/teacher", verifyToken, function (req, res, next) {
  TeacherModel.find({}, function (err, teachers) {
    res.send({ code: 0, data: teachers });
  })
});

// 按老师查询课程列表
router.get("/teacher/course", verifyToken, function (req, res, next) {
  const { teacher_name } = req.query;
  CourseModel.find({ teacher_name: teacher_name }, function (err, courses) {
    if (err) {
      res.send({ code: 1, msg: "Not Found" });
    }
    else {
      res.send({ code: 0, data: courses });
    }
  });
});

// 给某一门课评分
router.post("/score", verifyToken, function (req, res, next) {
  const { course_id, newscore_string, course_name } = req.body;
  const openid = req.payload.openid;
  const score_first = newscore_string[0], score_second = newscore_string[1];
  const newscore_number = Number(newscore_string);
  let newscore_flag, oldscore_flag;
  function assignFlag(score_number) {
    let flag;
    if (score_number < 60) {
      flag = "0";
    }
    else if (score_number < 70) {
      flag = "1";
    }
    else if (score_number < 80) {
      flag = "2";
    }
    else if (score_number < 90) {
      flag = "3";
    }
    else {
      flag = "4";
    }
    return flag;
  }
  newscore_flag = assignFlag(newscore_number);

  CourseModel.findOne({ _id: course_id }, function (err, course) {
    let { total_score, people_count, average, scores, percentage, above90, between80_90 } = course;
    let oldscore_number, people_delta;
    // 更新分数表
    ScoreModel.findOne({ openid, course_id }, function (err, score) {
      let newscore_json = {
        first: score_first,
        second: score_second
      }
      // 第一次添加该课程分数
      if (!score) {
        oldscore_number = 0;
        people_delta = 1;
        new ScoreModel({ openid: openid, course_id: course_id, score: newscore_json, course_name: course_name }).save(function (err, doc) {
          // res.send({ code: 0, data: res });
        });
      }
      // 修改该课程分数
      else {
        oldscore_number = Number(score.score.first) * 10 + Number(score.score.second);
        oldscore_flag = assignFlag(oldscore_number);
        people_delta = 0;
        ScoreModel.updateOne({ openid, course_id }, { score: newscore_json, course_name: course_name }, function (err, doc) {
          // res.send({ code: 0, data: doc });
        });
      }
      total_score = total_score - oldscore_number + newscore_number;
      people_count += people_delta;
      average = (total_score / people_count).toFixed(2);
      scores[newscore_flag] += 1;
      scores[oldscore_flag] -= 1;
      indexs = ["0", "1", "2", "3", "4"];
      for (let index in indexs) {
        percentage[index] = (scores[index] / people_count * 100).toFixed(2);
      }
      above90 = Number(percentage['4']);
      between80_90 = Number(percentage['3']);
      // 更新课程表
      CourseModel.update(
        { _id: course_id },
        { total_score: total_score, people_count: people_count, average: average, scores: scores, percentage: percentage, above90: above90, between80_90: between80_90 },
        function (err, doc) {
          if (err) {
            res.send({ code: 1, data: err });
          }
          else {
            res.send({ code: 0, data: doc });
          }
        }
      );
    });
  });
});

// 后台管理添加课程
router.post("/backstage/addcourse", function (req, res, next) {
  const { course_name, teacher_name } = req.body;
  CourseModel.findOne({ course_name, teacher_name }, function (err, course) {
    if (course) {
      res.send({ code: 1, msg: "Course Existed!" });
    }
    else {
      let teacher_id;
      TeacherModel.findOne({ teacher_name: teacher_name }, function (err, teacher) {
        teacher_id = teacher._id;
        console.log("teacherid:", teacher_id);
        new CourseModel({ course_name: course_name, teacher_id: teacher_id, teacher_name: teacher_name }).save(function (err, course) {
          console.log(course);
          res.send({ code: 0, data: course });
        });
      });
    }
  })
});

// 后台管理添加老师
router.post("/backstage/addteacher", function (req, res, next) {
  const { teacher_name, gender } = req.body;
  TeacherModel.findOne({ teacher_name, gender }, function (err, teacher) {
    if (teacher) {
      res.send({ code: 1, msg: "Teacher Existed!" });
    }
    else {
      new TeacherModel({ teacher_name: teacher_name, gender: gender }).save(function (err, teacher) {
        res.send({ code: 0, data: teacher });
      });
    }
  });
});

// 实现搜索
router.get("/search", verifyToken, function (req, res, next) {
  const { search_word } = req.query;
  console.log(search_word);
  CourseModel.find({
    $or: [
      { course_name: { $regex: search_word, $options: "$i" } },
      { teacher_name: { $regex: search_word, $options: "$i" } }
    ]
  }, function (err, courses) {
    res.send({ code: 0, data: courses });
  })
});

module.exports = router;
