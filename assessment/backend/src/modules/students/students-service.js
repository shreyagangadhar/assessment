const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, updateStudentInDB, deleteStudentFromDB } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
    
    // Check if the user is actually a student
    if (isStudentFound.role_id !== 3) {
        throw new ApiError(400, "User is not a student");
    }
    
    return isStudentFound;
}

const getAllStudents = async (payload) => {
    try {
        const students = await findAllStudents(payload);
        if (students.length <= 0) {
            throw new ApiError(404, "Students not found");
        }
        return students;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to retrieve students");
    }
}

const getStudentDetail = async (id) => {
    try {
        await checkStudentId(id);
        const student = await findStudentDetail(id);
        if (!student) {
            throw new ApiError(404, "Student details not found");
        }
        return student;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to retrieve student details");
    }
}

const addNewStudent = async (payload) => {
    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    
    try {
        // Enhanced validation
        if (!payload.name || !payload.email) {
            throw new ApiError(400, "Name and email are required fields");
        }
        
        if (!payload.class || !payload.section) {
            throw new ApiError(400, "Class and section are required fields");
        }
        
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw new ApiError(500, result.message);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    try {
        // Enhanced validation
        if (!payload.userId) {
            throw new ApiError(400, "Student ID is required");
        }
        
        if (!payload.name || !payload.email) {
            throw new ApiError(400, "Name and email are required fields");
        }
        
        await checkStudentId(payload.userId);
        
        const result = await updateStudentInDB(payload);
        if (!result.success) {
            throw new ApiError(500, result.message || "Unable to update student");
        }

        return { message: result.message };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to update student");
    }
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    try {
        // Enhanced validation
        if (!userId) {
            throw new ApiError(400, "Student ID is required");
        }
        
        if (reviewerId === undefined) {
            throw new ApiError(400, "Reviewer ID is required");
        }
        
        if (status === undefined || ![0, 1].includes(status)) {
            throw new ApiError(400, "Status must be 0 (disabled) or 1 (enabled)");
        }
        
        await checkStudentId(userId);

        const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
        if (affectedRow <= 0) {
            throw new ApiError(500, "Unable to update student status");
        }

        return { message: "Student status changed successfully" };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to update student status");
    }
}

const deleteStudent = async ({ userId, reviewerId }) => {
    try {
        console.log(`Service: Starting delete for student ID: ${userId}`);
        
        // Check if student exists and is actually a student
        await checkStudentId(userId);
        console.log('Service: Student validation passed');
        
        // Attempt to delete the student
        const result = await deleteStudentFromDB({ userId, reviewerId });
        if (!result.success) {
            throw new ApiError(500, result.message || "Unable to delete student");
        }

        console.log('Service: Student deleted successfully');
        return { message: "Student deleted successfully" };
    } catch (error) {
        console.error('Service: Error in deleteStudent:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to delete student");
    }
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudent,
};
