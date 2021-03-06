require 'test_helper'

class AdminControllerTest < ActionController::TestCase
  def setup
    Rails.application.credentials.stubs(:secret_key_base).returns('123') # to mock master key in ci tests
  end

  def test_admin_hook__new_user
    params = {
      admin: {
        email: "test@test.com",
        nu_id: "001234567",
        is_advisor: false,
        major: "Computer Science, BSCS",
        first_name: "Test",
        last_name: "Tester",
        courses: [
          {
            subject: "CS",
            course_id: "1200",
            semester: "202010",
            completion: "TRANSFER",
          },
          {
            subject: "CS",
            course_id: "2500",
            semester: "202010",
            completion: "PASSED",
          },
        ],
        photo_url:
          "https://prod-web.neu.edu/wasapp/EnterprisePhotoService/PhotoServlet?vid=CCS&er=d1d26b1327817a8d34ce75336e0334cb78f33e63cf907ea82da6d6abcfc15d66244bb291baec1799cf77970e4a519a1cf7d48edaddb97c01",
      }
    }

    assert_difference "User.count", 1 do
      post :admin_hook, params: params, format: "json"
    end

    assert_response :ok

    user_jwt = JWT.encode({ id: User.last.id, exp: AdminController::LOGIN_TOKEN_EXPIRATION.from_now.to_i }, Rails.application.credentials.secret_key_base)

    json_response = JSON.parse(response.body)
    assert_equal "http://test.com/api/v1/entry?user_id=#{user_jwt}", json_response['redirect']
    assert_equal "Test Tester", User.last.full_name
  end

  def test_admin_hook__existing_user
    user = create(:user)
    user.update!(email: 'test@test.com')

    photo_url = "https://prod-web.neu.edu/wasapp/EnterprisePhotoService/PhotoServlet?vid=CCS&er=d1d26b1327817a8d34ce75336e0334cb78f33e63cf907ea82da6d6abcfc15d66244bb291baec1799cf77970e4a519a1cf7d48edaddb97c01"

    params = {
      admin: {
        email: "test@test.com",
        nu_id: "001234567",
        is_advisor: false,
        major: "Computer Science, BSCS",
        first_name: "Test",
        last_name: "Tester",
        courses: [
          {
            subject: "CS",
            course_id: "1200",
            semester: "202010",
            completion: "TRANSFER",
          },
          {
            subject: "CS",
            course_id: "2500",
            semester: "202010",
            completion: "PASSED",
          },
        ],
        photo_url: photo_url,
      }
    }

    assert_no_difference "User.count" do
      post :admin_hook, params: params, format: "json"
    end

    assert_response :ok

    user_jwt = JWT.encode({ id: user.id, exp: AdminController::LOGIN_TOKEN_EXPIRATION.from_now.to_i }, Rails.application.credentials.secret_key_base)

    json_response = JSON.parse(response.body)
    assert_equal "http://test.com/api/v1/entry?user_id=#{user_jwt}", json_response['redirect']

    user.reload
    assert_equal "test@test.com", user.email
    assert_equal "Test Tester", user.full_name
    assert_equal false, user.is_advisor
    assert_equal photo_url, user.image_url
  end

  def test_entry
    user = create(:user)
    user_jwt = JWT.encode({ id: user.id, exp: AdminController::LOGIN_TOKEN_EXPIRATION.from_now.to_i }, Rails.application.credentials.secret_key_base)

    get :entry, params: { user_id: user_jwt }

    assert_response 302
    assert user_jwt, cookies[:auth_token]
    assert_redirected_to "http://test-frontend.com/redirect"
  end

  def test_entry__no_user
    user = create(:user)
    user_jwt = JWT.encode({ id: user.id, exp: AdminController::LOGIN_TOKEN_EXPIRATION.from_now.to_i }, Rails.application.credentials.secret_key_base)

    user.destroy

    get :entry, params: { user_id: user_jwt }

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert "User does not exist with id: #{user_jwt}", json_response['errors']
  end
end