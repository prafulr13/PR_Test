import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/client";

const InputForm = (props) => {
  const [session] = useSession();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();
  const [responseData, setResponseData] = useState({});

  console.log(watch("courseName")); // watch input value by passing the name of it

  const onSubmit = (data) => {
    console.log(data);
    const url = `https://tamsite.desire2learn.com/d2l/api/lp/1.30/courses/`;

    const courseInfo = {
      Name: data.courseName,
      Code: data.courseCode,
      Path: "",
      //CourseTemplateId: data.courseTemplate,
      CourseTemplateId: 7241,
      SemesterId: 9983,
      StartDate: null,
      EndDate: null,
      LocaleId: null,
      ForceLocale: false,
      ShowAddressBook: false,
      Description: {
        Content: data.courseDescription,
        Type: "Text"
      },
      CanSelfRegister: data.discoverEnabled
    };
    console.log(JSON.stringify(courseInfo));
    fetch(url, {
      method: "POST", // or ‘PUT’

      body: JSON.stringify(courseInfo), // data can be `string` or {object}!

      headers: { Authorization: "Bearer " + session.accessToken },
      "Content-Type": "application/json"
    })
      .then((res) => res.json())

      .catch((error) => console.error("Error:", error))

      .then(
        (response) => setResponseData({ body: response }),
        console.log(responseData)
      );
  };

  return (
    <div className="flex flex-col h-screen justify-top items-center bg-gray-300 py-8">
      <form
        className="bg-grey-100 text-center rounded py-8 px-5 shadow max-w-xs"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="p-3 text-2xl">Enter Course Details</h1>
        <p className="text-red-500"></p>

        <br />

        <label>Course Title</label>
        <input
          className="border-gray-300 mb-4 w-full border-solid border rounded py-2 px-4"
          name="courseName"
          defaultValue=""
          {...register("courseName")}
        />
        {errors.courseName && <span>This field is required</span>}
        <label>Course Code</label>
        <input
          className="border-gray-300 mb-4 w-full border-solid border rounded py-2 px-4"
          name="courseCode"
          defaultValue=""
          {...register("courseCode")}
        />
        {/*}
        <label>Course Template</label>
        <input
          className="border-gray-300 mb-4 w-full border-solid border rounded py-2 px-4"
          name="courseTemplate"
          defaultValue=""
          {...register("courseTemplate")}
        />
  */}
        <label htmlFor="discoverEnabled">Available in Discover</label>
        <input
          className="border-gray-300 mb-4 w-full border-solid border rounded py-2 px-4"
          type="checkbox"
          name="discoverEnabled"
          placeholder="discover"
          value="true"
          {...register("discoverEnabled")}
        />

        <label>Course Description</label>
        <input
          className="border-gray-300 mb-4 w-full border-solid border rounded py-2 px-4"
          name="courseDescription"
          {...register("courseDescription")}
        />

        <input
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          type="submit"
        />
      </form>

      <pre>
        {" "}
        {responseData ? JSON.stringify(responseData.body, 2, "\t") : null}{" "}
      </pre>
    </div>
  );
};

export default InputForm;
