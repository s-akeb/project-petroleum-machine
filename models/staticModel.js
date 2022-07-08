const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const staticSchema = new Schema(
  {
    type: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCK", "DELETE"],
      default: "ACTIVE",
    },
    userType: {
      type: String,
      enum: ["ADMIN", "USER"],       //Type USER.
      default: "USER"
    },
  },
  { timestamps: true }
);
let staticModel = mongoose.model("static", staticSchema);
module.exports = staticModel;

staticModel.find({ status: { $ne: "DELETE" } }, (staticErr, staticResult) => {
  if (staticErr) {
    console.log("Static query error:", staticErr);
  } else if (staticResult.length != 0) {
    console.log("Static content already exist.");
  } else {
    let obj1 = {
      type: "T&C",
      title: "Terms and Conditions",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    };
    let obj2 = {
      type: "P&P",
      title: "Privacy  and Policy",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    };
    let obj3 = {
      type: "AboutUs",
      title: "About Us",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    };
    staticModel.create(obj1, obj2, obj3, (createErr, createResult) => {
      if (createErr) {
        console.log("Static creation error:", createErr);
      } else {
        console.log("Static content created successfully!");
      }
    });
  }
});
