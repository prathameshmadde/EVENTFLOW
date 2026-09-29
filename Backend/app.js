const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_DIR = path.join(
  __dirname,
  '..',
  'Frontend'
);

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'eventflow-local-secret-change-this';

const SESSION_DAYS =
  Number(process.env.SESSION_DAYS) || 7;


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true
  })
);

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);


/* =========================================================
   FRONTEND
========================================================= */

app.use(
  express.static(FRONTEND_DIR)
);


/* =========================================================
   MYSQL CONNECTION
========================================================= */

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eventflow',
  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,

  connectionLimit:
    Number(process.env.DB_CONNECTION_LIMIT) || 10,

  queueLimit: 0,

  decimalNumbers: true
});


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function int(value) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
}


function num(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}


function text(value, fallback = null) {

  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  const result = String(value).trim();

  return result
    ? result
    : fallback;
}


function upper(value, fallback = '') {

  return String(
    value ?? fallback
  )
    .trim()
    .toUpperCase();
}


function normalizeRole(value) {

  const r = upper(value);

  if (r === 'ADMIN') {
    return 'ADMIN';
  }

  if (
    r === 'MANAGER' ||
    r === 'EVENT_MANAGER' ||
    r === 'EVENT MANAGER'
  ) {
    return 'EVENT_MANAGER';
  }

  return 'CUSTOMER';
}


function validEmail(email) {

  return /^\S+@\S+\.\S+$/.test(
    email || ''
  );
}


async function query(
  sql,
  params = [],
  connection = db
) {

  const [rows] =
    await connection.execute(
      sql,
      params
    );

  return rows;
}


async function one(
  sql,
  params = [],
  connection = db
) {

  const result =
    await query(
      sql,
      params,
      connection
    );

  return result[0] || null;
}


function sendError(
  res,
  message,
  error,
  status = 500
) {

  console.error(
    '[EventFlow]',
    message,
    error?.message || error
  );

  const body = {
    message
  };

  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    if (error?.message) {
      body.error = error.message;
    }
  }

  return res
    .status(status)
    .json(body);
}


/* =========================================================
   RESPONSE ALIASES
   Supports snake_case + camelCase + simple id
========================================================= */

function aliases(row) {

  if (
    !row ||
    Array.isArray(row) ||
    typeof row !== 'object'
  ) {
    return row;
  }

  const result = {
    ...row
  };

  const map = {

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    


    created_at: 'createdAt',

    updated_at: 'updatedAt',


    event_name: 'eventName',

    requirement_title: 'requirementTitle',

    event_date: 'eventDate',

    event_end_date: 'eventEndDate',

    guest_count: 'guestCount',

    special_requirements:
      'specialRequirements',

    package_name:
      'packageName',

    final_amount:
      'finalAmount',

    estimated_amount:
      'estimatedAmount',

    selected_services:
      'selectedServices',

    service_customizations:
      'serviceCustomizations',


    payment_type:
      'paymentType',

    payment_method:
      'paymentMethod',

    transaction_id:
      'transactionId',

    payment_date:
      'paymentDate',


    refund_transaction_id:
      'refundTransactionId',

    requested_by:
      'requestedBy',

    approved_by:
      'approvedBy',

    requested_at:
      'requestedAt',

    processed_at:
      'processedAt',


    assigned_admin:
      'assignedAdmin',

    sender_id:
      'senderId',


    manager_name:
      'managerName',

    customer_name:
      'customerName',

    business_name:
      'businessName',


    base_price:
      'basePrice',

    is_customizable:
      'isCustomizable',

    customization_details:
      'customizationDetails',

    proposal_count:
      'proposalCount',

    amount_paid:
      'amountPaid',

    rsvp_status:
      'rsvpStatus',

    task_name:
      'taskName',

    start_date:
      'startDate',

    due_date:
      'dueDate'

  };


  for (
    const [snake, camel]
    of Object.entries(map)
  ) {

    if (
      result[snake] !== undefined &&
      result[camel] === undefined
    ) {

      result[camel] =
        result[snake];

    }

  }

  return result;
}


function sendRows(
  res,
  data
) {

  if (Array.isArray(data)) {

    return res.json(
      data.map(aliases)
    );

  }

  return res.json(
    aliases(data)
  );
}


/* =========================================================
   SESSION
========================================================= */

function createSession(user) {

  const payload = {

    user_id:
      Number(user.user_id),

    role:
      user.role,

    status:
      user.status,

    exp:
      Date.now() +
      SESSION_DAYS *
      24 *
      60 *
      60 *
      1000

  };


  const encoded =
    Buffer
      .from(
        JSON.stringify(payload)
      )
      .toString('base64url');


  const signature =
    crypto
      .createHmac(
        'sha256',
        SESSION_SECRET
      )
      .update(encoded)
      .digest('base64url');


  return (
    encoded +
    '.' +
    signature
  );
}


function readSession(token) {

  try {

    const [
      encoded,
      signature
    ] =
      String(token || '')
        .split('.');


    if (
      !encoded ||
      !signature
    ) {
      return null;
    }


    const expected =
      crypto
        .createHmac(
          'sha256',
          SESSION_SECRET
        )
        .update(encoded)
        .digest('base64url');


    if (
      signature.length !==
      expected.length
    ) {

      return null;

    }


    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      )
    ) {

      return null;

    }


    const payload =
      JSON.parse(
        Buffer
          .from(
            encoded,
            'base64url'
          )
          .toString('utf8')
      );


    if (
      !payload ||
      !payload.user_id ||
      !payload.exp
    ) {

      return null;

    }


    if (
      payload.exp <
      Date.now()
    ) {

      return null;

    }


    return payload;

  } catch (error) {

    return null;

  }

}


/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function requireAuth(
  req,
  res,
  next
) {

  const header =
    req.get('Authorization') ||
    '';


  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || '');


  const session =
    readSession(token);


  if (!session) {

    return res
      .status(401)
      .json({
        message:
          'Please log in to continue'
      });

  }


  req.auth =
    session;


  next();
}


function requireRole(
  ...roles
) {

  return (
    req,
    res,
    next
  ) => {

    if (
      !req.auth ||
      !roles.includes(
        req.auth.role
      )
    ) {

      return res
        .status(403)
        .json({
          message:
            'You do not have access to this action'
        });

    }


    next();

  };

}


/* =========================================================
   MANAGER PROFILE HELPER
========================================================= */

async function getManagerProfile(
  userId,
  connection = db
) {

  return one(
    `
      SELECT *
      FROM event_manager_profiles
      WHERE user_id = ?
    `,
    [userId],
    connection
  );

}


/* =========================================================
   BOOKING ACCESS
========================================================= */

async function canAccessBooking(
  bookingId,
  auth,
  connection = db
) {

  const booking =
    await one(
      `
        SELECT *
        FROM bookings
        WHERE booking_id = ?
      `,
      [bookingId],
      connection
    );


  if (!booking) {

    return {
      allowed: false,
      status: 404,
      booking: null
    };

  }


  if (
    auth.role === 'ADMIN'
  ) {

    return {
      allowed: true,
      booking
    };

  }


  if (
    auth.role === 'CUSTOMER' &&
    Number(
      booking.customer_id
    ) === Number(
      auth.user_id
    )
  ) {

    return {
      allowed: true,
      booking
    };

  }


  if (
    auth.role ===
    'EVENT_MANAGER'
  ) {

    const profile =
      await getManagerProfile(
        auth.user_id,
        connection
      );


    if (
      profile &&
      Number(
        profile.manager_id
      ) ===
      Number(
        booking.manager_id
      )
    ) {

      return {
        allowed: true,
        booking
      };

    }

  }


  return {
    allowed: false,
    status: 403,
    booking
  };

}


/* =========================================================
   FULL BOOKING
========================================================= */

async function getFullBooking(
  bookingId,
  connection = db
) {

  return one(
    `
      SELECT

        
          b.*,
          COALESCE(p.price, b.final_amount) AS final_amount,
          COALESCE(er.requirement_title, b.event_name) AS event_name,

          e.event_name AS event_type,

          emp.business_name,

          emp.location AS manager_location,

          emp.rating AS manager_rating,

          u.name AS manager_name,

          u.email AS manager_email,

          c.name AS customer_name,

          c.email AS customer_email,

          p.package_name,

          p.description AS proposal_description,


        p.price AS proposal_price,

        COALESCE(

          (
            SELECT
              SUM(pm.amount)

            FROM payments pm

            WHERE
              pm.booking_id =
              b.booking_id

              AND pm.status =
              'SUCCESS'

          ),

          0

        ) AS amount_paid


      FROM bookings b


      JOIN events e

        ON
          b.event_id =
          e.event_id


      JOIN event_manager_profiles emp

        ON
          b.manager_id =
          emp.manager_id


      JOIN users u

        ON
          emp.user_id =
          u.user_id


      JOIN users c

        ON
          b.customer_id =
          c.user_id


      LEFT JOIN proposals p
        ON
          b.proposal_id =
          p.proposal_id

      LEFT JOIN event_requirements er
        ON p.requirement_id = er.requirement_id


      WHERE
        b.booking_id = ?
    `,
    [bookingId],
    connection
  );

}


/* =========================================================
   HEALTH
========================================================= */

app.get(
  '/api/health',
  async (
    req,
    res
  ) => {

    try {

      await query(
        'SELECT 1 AS ok'
      );


      return res.json({

        status: 'ok',

        message:
          'EventFlow backend and MySQL are working'

      });

    } catch (error) {

      return sendError(
        res,
        'Database connection failed',
        error,
        500
      );

    }

  }
);


/* =========================================================
   HOME PAGE
========================================================= */

app.get(
  '/',
  (
    req,
    res
  ) => {

    res.sendFile(
      path.join(
        FRONTEND_DIR,
        'index.html'
      )
    );

  }
);


/* =========================================================
   AUTH - REGISTER
========================================================= */

async function registerHandler(
  req,
  res
) {

  const connection =
    await db.getConnection();


  try {

    const name =
      text(req.body.name);


    const email =
      text(
        req.body.email,
        ''
      )?.toLowerCase();


    const phone =
      text(req.body.phone);


    const password =
      String(
        req.body.password || ''
      );


    const userRole =
      normalizeRole(
        req.body.role
      );


    const location =
      text(
        req.body.location ||
        req.body.city
      );


    if (
      !name ||
      !email ||
      !password
    ) {

      return res
        .status(400)
        .json({
          message:
            'Name, email and password are required'
        });

    }


    if (
      !validEmail(email)
    ) {

      return res
        .status(400)
        .json({
          message:
            'Enter a valid email address'
        });

    }


    if (
      password.length < 6
    ) {

      return res
        .status(400)
        .json({
          message:
            'Password must be at least 6 characters'
        });

    }


    if (
      userRole === 'ADMIN'
    ) {

      return res
        .status(403)
        .json({
          message:
            'Admin accounts cannot be created through registration'
        });

    }


    const existing =
      await one(
        `
          SELECT user_id
          FROM users
          WHERE email = ?
        `,
        [email],
        connection
      );


    if (existing) {

      return res
        .status(409)
        .json({
          message:
            'Email already registered'
        });

    }


    await connection.beginTransaction();


    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );


    const [
      userResult
    ] =
      await connection.execute(
        `
          INSERT INTO users
          (
            name,
            email,
            phone,
            password_hash,
            role,
            status
          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,
        [
          name,
          email,
          phone,
          passwordHash,
          userRole,
          'ACTIVE'
        ]
      );


    let managerProfile =
      null;


    if (
      userRole ===
      'EVENT_MANAGER'
    ) {

      const [
        managerResult
      ] =
        await connection.execute(
          `
            INSERT INTO
            event_manager_profiles
            (
              user_id,
              business_name,
              description,
              experience,
              location,
              rating,
              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [
            userResult.insertId,

            name,

            'New EventFlow manager',

            0,

            location,

            0,

            'ACTIVE'
          ]
        );


      managerProfile =
        await one(
          `
            SELECT *
            FROM event_manager_profiles
            WHERE manager_id = ?
          `,
          [
            managerResult.insertId
          ],
          connection
        );

    }


    await connection.commit();


    const user = {

      user_id:
        userResult.insertId,

      name,

      email,

      phone,

      role:
        userRole,

      status:
        'ACTIVE'

    };


    const token =
      createSession(
        user
      );


    return res
      .status(201)
      .json({

        message:
          'Registration successful',

        session_token:
          token,

        user_id:
          user.user_id,

        role:
          user.role,

        user:
          aliases(user),

        manager_profile:
          aliases(managerProfile)

      });


  } catch (error) {

    try {

      await connection.rollback();

    } catch (_) {}


    return sendError(
      res,
      'Registration failed',
      error,
      500
    );


  } finally {

    connection.release();

  }

}


/* Two supported paths */

app.post(
  '/api/register',
  registerHandler
);

app.post(
  '/api/auth/register',
  registerHandler
);


/* =========================================================
   AUTH - LOGIN
========================================================= */

async function loginHandler(
  req,
  res
) {

  try {

    const email =
      text(
        req.body.email,
        ''
      )?.toLowerCase();


    const password =
      String(
        req.body.password || ''
      );


    const requestedRole =
      req.body.role
        ? normalizeRole(
            req.body.role
          )
        : null;


    if (
      !email ||
      !password
    ) {

      return res
        .status(400)
        .json({
          message:
            'Email and password are required'
        });

    }


    const user =
      await one(
        `
          SELECT *
          FROM users
          WHERE email = ?
        `,
        [email]
      );


    if (
      !user ||
      upper(
        user.status
      ) !== 'ACTIVE'
    ) {

      return res
        .status(401)
        .json({
          message:
            'Invalid email or password'
        });

    }


    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );


    if (!passwordMatches) {

      return res
        .status(401)
        .json({
          message:
            'Invalid email or password'
        });

    }


    if (
      requestedRole &&
      requestedRole !==
      user.role
    ) {

      return res
        .status(403)
        .json({

          message:
            `This account is registered as ${user.role}`

        });

    }


    const cleanUser = {

      user_id:
        user.user_id,

      name:
        user.name,

      email:
        user.email,

      phone:
        user.phone,

      role:
        user.role,

      status:
        user.status

    };


    const managerProfile =
      user.role ===
      'EVENT_MANAGER'

        ? await getManagerProfile(
            user.user_id
          )

        : null;


    const token =
      createSession(
        user
      );


    return res.json({

      message:
        'Login successful',

      session_token:
        token,

      user_id:
        cleanUser.user_id,

      name:
        cleanUser.name,

      email:
        cleanUser.email,

      phone:
        cleanUser.phone,

      role:
        cleanUser.role,

      status:
        cleanUser.status,

      user:
        aliases(cleanUser),

      manager_profile:
        aliases(managerProfile)

    });


  } catch (error) {

    return sendError(
      res,
      'Login failed',
      error,
      500
    );

  }

}


app.post(
  '/api/login',
  loginHandler
);

app.post(
  '/api/auth/login',
  loginHandler
);


app.post(
  '/api/logout',
  (
    req,
    res
  ) => {

    res.json({
      message:
        'Logged out successfully'
    });

  }
);


/* =========================================================
   USERS
========================================================= */

app.get(
  '/api/users',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const users =
        await query(
          `
            SELECT
              user_id,
              name,
              email,
              phone,
              role,
              status,
              created_at

            FROM users

            ORDER BY
              user_id DESC
          `
        );


      return sendRows(
        res,
        users
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load users',
        error
      );

    }

  }
);


app.get(
  '/api/users/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const userId =
        int(req.params.id);


      if (!userId) {

        return res
          .status(400)
          .json({
            message:
              'Invalid user id'
          });

      }


      if (
        req.auth.role !==
        'ADMIN' &&

        Number(
          req.auth.user_id
        ) !== userId
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this user'
          });

      }


      const user =
        await one(
          `
            SELECT
              user_id,
              name,
              email,
              phone,
              role,
              status,
              created_at

            FROM users

            WHERE user_id = ?
          `,
          [userId]
        );


      if (!user) {

        return res
          .status(404)
          .json({
            message:
              'User not found'
          });

      }


      return res.json(
        aliases(user)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load user',
        error
      );

    }

  }
);


app.put(
  '/api/users/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const userId =
        int(req.params.id);


      if (!userId) {

        return res
          .status(400)
          .json({
            message:
              'Invalid user id'
          });

      }


      if (
        req.auth.role !==
        'ADMIN' &&

        Number(
          req.auth.user_id
        ) !== userId
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this user'
          });

      }


      const current =
        await one(
          `
            SELECT *
            FROM users
            WHERE user_id = ?
          `,
          [userId]
        );


      if (!current) {

        return res
          .status(404)
          .json({
            message:
              'User not found'
          });

      }


      const name =
        text(
          req.body.name,
          current.name
        );


      const phone =
        text(
          req.body.phone,
          current.phone
        );


      const status =
        req.auth.role ===
        'ADMIN' &&
        req.body.status

          ? upper(
              req.body.status
            )

          : current.status;


      await query(
        `
          UPDATE users

          SET
            name = ?,
            phone = ?,
            status = ?

          WHERE user_id = ?
        `,
        [
          name,
          phone,
          status,
          userId
        ]
      );


      return res.json({
        message:
          'User updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update user',
        error
      );

    }

  }
);


app.delete(
  '/api/users/:id',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const userId =
        int(req.params.id);


      await query(
        `
          DELETE FROM users
          WHERE user_id = ?
        `,
        [userId]
      );


      return res.json({
        message:
          'User deleted successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to delete user',
        error
      );

    }

  }
);


/* =========================================================
   EVENTS
========================================================= */

app.get(
  '/api/events',
  async (
    req,
    res
  ) => {

    try {

      const events =
        await query(
          `
            SELECT *

            FROM events

            ORDER BY
              event_id
          `
        );


      return sendRows(
        res,
        events
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load events',
        error
      );

    }

  }
);


app.get(
  '/api/events/:id',
  async (
    req,
    res
  ) => {

    try {

      const event =
        await one(
          `
            SELECT *

            FROM events

            WHERE event_id = ?
          `,
          [
            int(req.params.id)
          ]
        );


      if (!event) {

        return res
          .status(404)
          .json({
            message:
              'Event not found'
          });

      }


      return res.json(
        aliases(event)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load event',
        error
      );

    }

  }
);


/* =========================================================
   MANAGERS
========================================================= */

app.get(
  '/api/managers',
  async (
    req,
    res
  ) => {

    try {

      const managers =
        await query(
          `
            SELECT

              emp.*,

              u.name,

              u.email,

              u.phone

            FROM
              event_manager_profiles emp

            JOIN users u

              ON
                emp.user_id =
                u.user_id

            WHERE
              emp.status = 'ACTIVE'

              AND u.status = 'ACTIVE'

            ORDER BY
              emp.manager_id
          `
        );


      return sendRows(
        res,
        managers
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load managers',
        error
      );

    }

  }
);


app.get(
  '/api/managers/:id',
  async (
    req,
    res
  ) => {

    try {

      const manager =
        await one(
          `
            SELECT

              emp.*,

              u.name,

              u.email,

              u.phone

            FROM
              event_manager_profiles emp

            JOIN users u

              ON
                emp.user_id =
                u.user_id

            WHERE
              emp.manager_id = ?
          `,
          [
            int(req.params.id)
          ]
        );


      if (!manager) {

        return res
          .status(404)
          .json({
            message:
              'Manager not found'
          });

      }


      return res.json(
        aliases(manager)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load manager',
        error
      );

    }

  }
);


app.put(
  '/api/managers/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const managerId =
        int(req.params.id);


      const manager =
        await one(
          `
            SELECT *

            FROM event_manager_profiles

            WHERE manager_id = ?
          `,
          [managerId]
        );


      if (!manager) {

        return res
          .status(404)
          .json({
            message:
              'Manager not found'
          });

      }


      if (
        req.auth.role !==
        'ADMIN' &&

        Number(
          manager.user_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this manager profile'
          });

      }


      await query(
        `
          UPDATE event_manager_profiles

          SET

            business_name = ?,

            description = ?,

            experience = ?,

            location = ?

          WHERE
            manager_id = ?
        `,
        [

          text(
            req.body.business_name ||
            req.body.businessName,
            manager.business_name
          ),

          text(
            req.body.description,
            manager.description
          ),

          Number(
            req.body.experience ??
            manager.experience
          ),

          text(
            req.body.location ||
            req.body.city,
            manager.location
          ),

          managerId

        ]
      );


      return res.json({
        message:
          'Manager profile updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update manager profile',
        error
      );

    }

  }
);


/* =========================================================
   SERVICES
========================================================= */

app.get(
  '/api/services',
  async (
    req,
    res
  ) => {

    try {

      const services =
        await query(
          `
            SELECT

              s.*,

              emp.business_name,

              u.name AS manager_name

            FROM services s

            JOIN event_manager_profiles emp

              ON
                s.manager_id =
                emp.manager_id

            JOIN users u

              ON
                emp.user_id =
                u.user_id

            ORDER BY
              s.service_id
          `
        );


      return sendRows(
        res,
        services
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load services',
        error
      );

    }

  }
);


app.get(
  '/api/managers/:manager_id/services',
  async (
    req,
    res
  ) => {

    try {

      const managerId =
        int(
          req.params.manager_id
        );


      const services =
        await query(
          `
            SELECT *

            FROM services

            WHERE manager_id = ?

            ORDER BY
              service_id
          `,
          [managerId]
        );


      return sendRows(
        res,
        services
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load manager services',
        error
      );

    }

  }
);


app.post(
  '/api/services',
  requireAuth,
  requireRole(
    'EVENT_MANAGER',
    'ADMIN'
  ),
  async (
    req,
    res
  ) => {

    try {

      let managerId =
        int(
          req.body.manager_id ||
          req.body.managerId
        );


      if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const profile =
          await getManagerProfile(
            req.auth.user_id
          );


        if (!profile) {

          return res
            .status(404)
            .json({
              message:
                'Manager profile not found'
            });

        }


        managerId =
          profile.manager_id;

      }


      const serviceName =
        text(
          req.body.service_name ||
          req.body.serviceName
        );


      if (
        !managerId ||
        !serviceName
      ) {

        return res
          .status(400)
          .json({
            message:
              'manager_id and service_name are required'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO services
            (
              manager_id,
              service_name,
              description,
              base_price,
              is_customizable,
              customization_details,
              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            managerId,

            serviceName,

            text(
              req.body.description
            ),

            Number(
              req.body.base_price ??
              req.body.basePrice ??
              0
            ),

            Boolean(
              req.body.is_customizable ??
              req.body.isCustomizable
            )
              ? 1
              : 0,

            text(
              req.body.customization_details ||
              req.body.customizationDetails
            ),

            upper(
              req.body.status,
              'AVAILABLE'
            )

          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Service added successfully',

          service_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to add service',
        error
      );

    }

  }
);


app.put(
  '/api/services/:id',
  requireAuth,
  requireRole(
    'EVENT_MANAGER',
    'ADMIN'
  ),
  async (
    req,
    res
  ) => {

    try {

      const serviceId =
        int(req.params.id);


      const service =
        await one(
          `
            SELECT *

            FROM services

            WHERE service_id = ?
          `,
          [serviceId]
        );


      if (!service) {

        return res
          .status(404)
          .json({
            message:
              'Service not found'
          });

      }


      if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const profile =
          await getManagerProfile(
            req.auth.user_id
          );


        if (
          !profile ||
          Number(
            profile.manager_id
          ) !==
          Number(
            service.manager_id
          )
        ) {

          return res
            .status(403)
            .json({
              message:
                'You do not have access to this service'
            });

        }

      }


      await query(
        `
          UPDATE services

          SET

            service_name = ?,

            description = ?,

            base_price = ?,

            is_customizable = ?,

            customization_details = ?,

            status = ?

          WHERE
            service_id = ?
        `,
        [

          text(
            req.body.service_name ||
            req.body.serviceName,
            service.service_name
          ),

          text(
            req.body.description,
            service.description
          ),

          Number(
            req.body.base_price ??
            req.body.basePrice ??
            service.base_price
          ),

          Boolean(
            req.body.is_customizable ??
            req.body.isCustomizable ??
            service.is_customizable
          )
            ? 1
            : 0,

          text(
            req.body.customization_details ||
            req.body.customizationDetails,
            service.customization_details
          ),

          upper(
            req.body.status,
            service.status
          ),

          serviceId

        ]
      );


      return res.json({
        message:
          'Service updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update service',
        error
      );

    }

  }
);


app.delete(
  '/api/services/:id',
  requireAuth,
  requireRole(
    'EVENT_MANAGER',
    'ADMIN'
  ),
  async (
    req,
    res
  ) => {

    try {

      const serviceId =
        int(req.params.id);


      const service =
        await one(
          `
            SELECT *

            FROM services

            WHERE service_id = ?
          `,
          [serviceId]
        );


      if (!service) {

        return res
          .status(404)
          .json({
            message:
              'Service not found'
          });

      }


      if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const profile =
          await getManagerProfile(
            req.auth.user_id
          );


        if (
          !profile ||
          Number(
            profile.manager_id
          ) !==
          Number(
            service.manager_id
          )
        ) {

          return res
            .status(403)
            .json({
              message:
                'You do not have access to this service'
            });

        }

      }


      await query(
        `
          DELETE FROM services

          WHERE service_id = ?
        `,
        [serviceId]
      );


      return res.json({
        message:
          'Service deleted successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to delete service',
        error
      );

    }

  }
);


/* =========================================================
   REQUIREMENTS
========================================================= */

/*
  Customer:
      GET /api/requirements
      -> only own requirements

  Manager:
      GET /api/requirements
      -> open requirements

  Admin:
      GET /api/requirements
      -> all requirements
*/


app.get(
  '/api/requirements',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let requirements;


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        requirements =
          await query(
            `
              SELECT

                er.*,

                e.event_name,

                e.min_people,

                e.max_people,

                e.approx_package,

                (

                  SELECT
                    COUNT(*)

                  FROM proposals p

                  WHERE
                    p.requirement_id =
                    er.requirement_id

                ) AS proposal_count


              FROM
                event_requirements er


              JOIN events e

                ON
                  er.event_id =
                  e.event_id


              WHERE
                er.customer_id = ?


              ORDER BY
                er.created_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        requirements =
          await query(
            `
              SELECT

                er.*,

                e.event_name,

                u.name AS customer_name,

                (

                  SELECT
                    COUNT(*)

                  FROM proposals p

                  WHERE
                    p.requirement_id =
                    er.requirement_id

                ) AS proposal_count


              FROM
                event_requirements er


              JOIN events e

                ON
                  er.event_id =
                  e.event_id


              JOIN users u

                ON
                  er.customer_id =
                  u.user_id


              WHERE

                er.status IN
                (
                  'OPEN',
                  'PROPOSALS_RECEIVED'
                )
                -- AND er.customer_id <> ?


              ORDER BY
                er.created_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else {

        requirements =
          await query(
            `
              SELECT

                er.*,

                e.event_name,

                u.name AS customer_name,

                (

                  SELECT
                    COUNT(*)

                  FROM proposals p

                  WHERE
                    p.requirement_id =
                    er.requirement_id

                ) AS proposal_count


              FROM
                event_requirements er


              JOIN events e

                ON
                  er.event_id =
                  e.event_id


              JOIN users u

                ON
                  er.customer_id =
                  u.user_id


              ORDER BY
                er.created_at DESC
            `
          );

      }


      return sendRows(
        res,
        requirements
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load requirements',
        error
      );

    }

  }
);


/*
  Customer-specific requirement route
*/

app.get(
  '/api/customers/:customer_id/requirements',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let customerId =
        int(
          req.params.customer_id
        );


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        customerId =
          Number(
            req.auth.user_id
          );

      }


      if (
        req.auth.role !==
        'CUSTOMER' &&

        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      const requirements =
        await query(
          `
            SELECT

              er.*,

              e.event_name,

              (

                SELECT
                  COUNT(*)

                FROM proposals p

                WHERE
                  p.requirement_id =
                  er.requirement_id

              ) AS proposal_count


            FROM
              event_requirements er


            JOIN events e

              ON
                er.event_id =
                e.event_id


            WHERE
              er.customer_id = ?


            ORDER BY
              er.created_at DESC
          `,
          [customerId]
        );


      return sendRows(
        res,
        requirements
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer requirements',
        error
      );

    }

  }
);


/*
  Single requirement
*/

app.get(
  '/api/requirements/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const requirementId =
        int(
          req.params.id
        );


      const requirement =
        await one(
          `
            SELECT

              er.*,

              e.event_name,

              e.min_people,

              e.max_people,

              e.approx_package,

              u.name AS customer_name,

              u.email AS customer_email,

              (

                SELECT
                  COUNT(*)

                FROM proposals p

                WHERE
                  p.requirement_id =
                  er.requirement_id

              ) AS proposal_count


            FROM
              event_requirements er


            JOIN events e

              ON
                er.event_id =
                e.event_id


            JOIN users u

              ON
                er.customer_id =
                u.user_id


            WHERE
              er.requirement_id = ?
          `,
          [requirementId]
        );


      if (!requirement) {

        return res
          .status(404)
          .json({
            message:
              'Requirement not found'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER' &&

        Number(
          requirement.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this requirement'
          });

      }


      return res.json(
        aliases(
          requirement
        )
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load requirement',
        error
      );

    }

  }
);


/*
  Create requirement
*/

app.post(
  '/api/requirements',
  requireAuth,
  requireRole('CUSTOMER'),
  async (
    req,
    res
  ) => {

    try {

      const eventId =
        int(
          req.body.event_id ||
          req.body.eventId
        );


      const requirementTitle =
        text(
          req.body.requirement_title ||
          req.body.requirementTitle ||
          req.body.title
        );


      const eventDate =
        text(
          req.body.event_date ||
          req.body.eventDate ||
          req.body.date
        );


      const eventEndDate =
        text(
          req.body.event_end_date ||
          req.body.eventEndDate
        );


      const guestCount =
        int(
          req.body.guest_count ||
          req.body.guestCount
        );


      const location =
        text(
          req.body.location ||
          req.body.city
        );


      const description =
        text(
          req.body.description
        );


      const specialRequirements =
        text(
          req.body.special_requirements ||
          req.body.specialRequirements
        );


      const budget =
        num(
          req.body.budget
        );


      if (
        !eventId ||
        !requirementTitle ||
        !eventDate ||
        !guestCount
      ) {

        return res
          .status(400)
          .json({

            message:
              'event_id, requirement_title, event_date and guest_count are required'

          });

      }


      const event =
        await one(
          `
            SELECT *

            FROM events

            WHERE

              event_id = ?

              AND status = 'ACTIVE'
          `,
          [eventId]
        );


      if (!event) {

        return res
          .status(400)
          .json({
            message:
              'Selected event type is not available'
          });

      }


      if (
        guestCount <
        Number(
          event.min_people
        ) ||

        guestCount >
        Number(
          event.max_people
        )
      ) {

        return res
          .status(400)
          .json({

            message:
              `Guest count must be between ${event.min_people} and ${event.max_people}`

          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO
            event_requirements
            (
              customer_id,

              event_id,

              requirement_title,

              event_date,

              event_end_date,

              guest_count,

              location,

              description,

              special_requirements,

              budget,

              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            req.auth.user_id,

            eventId,

            requirementTitle,

            eventDate,

            eventEndDate,

            guestCount,

            location,

            description,

            specialRequirements,

            budget,

            'OPEN'

          ]
        );


      const created =
        await one(
          `
            SELECT

              er.*,

              e.event_name


            FROM
              event_requirements er


            JOIN events e

              ON
                er.event_id =
                e.event_id


            WHERE
              er.requirement_id = ?
          `,
          [
            result.insertId
          ]
        );


      
      try {
        const managers = await query("SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'");
        for (const m of managers) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [m.user_id, 'New Event Requirement', 'A new client requirement "' + requirementTitle + '" has been posted. Click to review and submit a proposal.', 'manager-requirements.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res
        .status(201)
        .json({

          message:
            'Requirement created successfully',

          requirement_id:
            result.insertId,

          id:
            result.insertId,

          requirement:
            aliases(created)

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to create requirement',
        error
      );

    }

  }
);


/*
  Update requirement
*/

app.put(
  '/api/requirements/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const requirementId =
        int(
          req.params.id
        );


      const old =
        await one(
          `
            SELECT *

            FROM event_requirements

            WHERE requirement_id = ?
          `,
          [
            requirementId
          ]
        );


      if (!old) {

        return res
          .status(404)
          .json({
            message:
              'Requirement not found'
          });

      }


      if (
        req.auth.role !==
        'ADMIN' &&

        Number(
          old.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this requirement'
          });

      }


      await query(
        `
          UPDATE event_requirements

          SET

            event_id = ?,

            requirement_title = ?,

            event_date = ?,

            event_end_date = ?,

            guest_count = ?,

            location = ?,

            description = ?,

            special_requirements = ?,

            budget = ?

          WHERE
            requirement_id = ?
        `,
        [

          int(
            req.body.event_id ||
            req.body.eventId
          ) ||
          old.event_id,

          text(
            req.body.requirement_title ||
            req.body.requirementTitle ||
            req.body.title,
            old.requirement_title
          ),

          text(
            req.body.event_date ||
            req.body.eventDate ||
            req.body.date,
            old.event_date
          ),

          text(
            req.body.event_end_date ||
            req.body.eventEndDate,
            old.event_end_date
          ),

          int(
            req.body.guest_count ||
            req.body.guestCount
          ) ||
          old.guest_count,

          text(
            req.body.location ||
            req.body.city,
            old.location
          ),

          text(
            req.body.description,
            old.description
          ),

          text(
            req.body.special_requirements ||
            req.body.specialRequirements,
            old.special_requirements
          ),

          req.body.budget !==
          undefined

            ? num(
                req.body.budget
              )

            : old.budget,

          requirementId

        ]
      );


      return res.json({
        message:
          'Requirement updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update requirement',
        error
      );

    }

  }
);


/*
  Requirement status
*/

app.put(
  '/api/requirements/:id/status',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const requirementId =
        int(
          req.params.id
        );


        await one(
          `
            SELECT *

            FROM event_requirements

            WHERE requirement_id = ?
          `,
          [requirementId]
        );


      if (!current) {

        return res
          .status(404)
          .json({
            message:
              'Requirement not found'
          });

      }


      if (
        req.auth.role !==
        'ADMIN' &&

        Number(
          current.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this requirement'
          });

      }


      const status =
        upper(
          req.body.status
        );


      if (
        ![
          'OPEN',
          'PROPOSALS_RECEIVED',
          'MANAGER_SELECTED',
          'CANCELLED',
          'COMPLETED'
        ].includes(status)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid requirement status'
          });

      }


      await query(
        `
          UPDATE event_requirements

          SET
            status = ?

          WHERE
            requirement_id = ?
        `,
        [
          status,
          requirementId
        ]
      );


      return res.json({
        message:
          'Requirement status updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update requirement status',
        error
      );

    }

  }
);


/*
  Delete requirement
*/

app.delete(
  '/api/requirements/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const requirementId =
        int(
          req.params.id
        );


      const requirement =
        await one(
          `
            SELECT *

            FROM event_requirements

            WHERE requirement_id = ?
          `,
          [requirementId]
        );


      if (!requirement) {

        return res
          .status(404)
          .json({
            message:
              'Requirement not found'
          });

      }


      if (
        req.auth.role !==
        'ADMIN' &&

        Number(
          requirement.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this requirement'
          });

      }


      const proposalCount =
        await one(
          `
            SELECT
              COUNT(*) AS count

            FROM proposals

            WHERE
              requirement_id = ?
          `,
          [requirementId]
        );


      await query('DELETE FROM proposals WHERE requirement_id = ?', [requirementId]);


      await query(
        `
          DELETE FROM event_requirements

          WHERE requirement_id = ?
        `,
        [
          requirementId
        ]
      );


      return res.json({
        message:
          'Requirement deleted successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to delete requirement',
        error
      );

    }

  }
);


/* =========================================================
   PROPOSALS
========================================================= */

app.get(
  '/api/proposals',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let proposals;


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        proposals =
          await query(
            `
              SELECT

                p.*,

                er.customer_id,

                er.requirement_title,

                er.event_date,

                er.event_end_date,

                er.guest_count,

                er.location,

                er.budget,

                er.status AS requirement_status,

                e.event_name,

                emp.business_name,

                emp.location AS manager_location,

                emp.rating,

                emp.experience,

                u.name AS manager_name,

                u.email AS manager_email,

                b.booking_id


              FROM proposals p


              JOIN event_requirements er

                ON
                  p.requirement_id =
                  er.requirement_id


              JOIN events e

                ON
                  er.event_id =
                  e.event_id


              JOIN event_manager_profiles emp

                ON
                  p.manager_id =
                  emp.manager_id


              JOIN users u

                ON
                  emp.user_id =
                  u.user_id


              LEFT JOIN bookings b

                ON
                  b.proposal_id =
                  p.proposal_id


              WHERE
                er.customer_id = ?


              ORDER BY
                p.created_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        if (!manager) {

          return res
            .status(404)
            .json({
              message:
                'Manager profile not found'
            });

        }


        proposals =
          await query(
            `
              SELECT

                p.*,

                er.customer_id,

                er.requirement_title,

                er.event_date,

                er.guest_count,

                er.location,

                er.budget,

                e.event_name,

                u.name AS customer_name,

                b.booking_id


              FROM proposals p


              JOIN event_requirements er

                ON
                  p.requirement_id =
                  er.requirement_id


              JOIN events e

                ON
                  er.event_id =
                  e.event_id


              JOIN users u

                ON
                  er.customer_id =
                  u.user_id


              LEFT JOIN bookings b

                ON
                  b.proposal_id =
                  p.proposal_id


              WHERE
                p.manager_id = ?


              ORDER BY
                p.created_at DESC
            `,
            [
              manager.manager_id
            ]
          );

      }

      else {

        proposals =
          await query(
            `
              SELECT

                p.*,

                er.customer_id,

                er.requirement_title,

                e.event_name,

                emp.business_name,

                u.name AS manager_name,

                b.booking_id


              FROM proposals p


              JOIN event_requirements er

                ON
                  p.requirement_id =
                  er.requirement_id


              JOIN events e

                ON
                  er.event_id =
                  e.event_id


              JOIN event_manager_profiles emp

                ON
                  p.manager_id =
                  emp.manager_id


              JOIN users u

                ON
                  emp.user_id =
                  u.user_id


              LEFT JOIN bookings b

                ON
                  b.proposal_id =
                  p.proposal_id


              ORDER BY
                p.created_at DESC
            `
          );

      }


      return sendRows(
        res,
        proposals
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load proposals',
        error
      );

    }

  }
);


/*
  Customer proposals
*/

app.get(
  '/api/customers/:customer_id/proposals',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let customerId =
        int(
          req.params.customer_id
        );


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        customerId =
          Number(
            req.auth.user_id
          );

      }


      if (
        req.auth.role !==
        'CUSTOMER' &&

        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      const proposals =
        await query(
          `
            SELECT

              p.*,

              er.customer_id,

              er.requirement_title,

              er.event_date,

              er.guest_count,

              er.location,

              er.budget,

              e.event_name,

              emp.business_name,

              emp.rating,

              u.name AS manager_name,

              b.booking_id


            FROM proposals p


            JOIN event_requirements er

              ON
                p.requirement_id =
                er.requirement_id


            JOIN events e

              ON
                er.event_id =
                e.event_id


            JOIN event_manager_profiles emp

              ON
                p.manager_id =
                emp.manager_id


            JOIN users u

              ON
                emp.user_id =
                u.user_id


            LEFT JOIN bookings b

              ON
                b.proposal_id =
                p.proposal_id


            WHERE
              er.customer_id = ?


            ORDER BY
              p.created_at DESC
          `,
          [customerId]
        );


      return sendRows(
        res,
        proposals
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer proposals',
        error
      );

    }

  }
);


/*
  Proposal by ID
*/

app.get(
  '/api/proposals/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const proposalId =
        int(req.params.id);


      const proposal =
        await one(
          `
            SELECT

              p.*,

              er.customer_id,

              er.requirement_title,

              er.event_date,

              er.event_end_date,

              er.guest_count,

              er.location,

              er.budget,

              er.status AS requirement_status,

              e.event_name,

              emp.business_name,

              emp.location AS manager_location,

              emp.rating,

              emp.experience,

              u.name AS manager_name,

              b.booking_id


            FROM proposals p


            JOIN event_requirements er

              ON
                p.requirement_id =
                er.requirement_id


            JOIN events e

              ON
                er.event_id =
                e.event_id


            JOIN event_manager_profiles emp

              ON
                p.manager_id =
                emp.manager_id


            JOIN users u

              ON
                emp.user_id =
                u.user_id


            LEFT JOIN bookings b

              ON
                b.proposal_id =
                p.proposal_id


            WHERE
              p.proposal_id = ?
          `,
          [
            proposalId
          ]
        );


      if (!proposal) {

        return res
          .status(404)
          .json({
            message:
              'Proposal not found'
          });

      }


      let allowed =
        req.auth.role ===
        'ADMIN';


      if (
        req.auth.role ===
        'CUSTOMER' &&
        Number(
          proposal.customer_id
        ) ===
        Number(
          req.auth.user_id
        )
      ) {

        allowed = true;

      }


      if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        if (
          manager &&
          Number(
            manager.manager_id
          ) ===
          Number(
            proposal.manager_id
          )
        ) {

          allowed = true;

        }

      }


      if (!allowed) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this proposal'
          });

      }


      return res.json(
        aliases(proposal)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load proposal',
        error
      );

    }

  }
);


/*
  Requirement -> proposals
*/

app.get(
  '/api/requirements/:requirement_id/proposals',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const requirementId =
        int(
          req.params.requirement_id
        );


      const requirement =
        await one(
          `
            SELECT *

            FROM event_requirements

            WHERE
              requirement_id = ?
          `,
          [
            requirementId
          ]
        );


      if (!requirement) {

        return res
          .status(404)
          .json({
            message:
              'Requirement not found'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER' &&

        Number(
          requirement.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this requirement'
          });

      }


      const proposals =
        await query(
          `
            SELECT

              p.*,

              emp.business_name,

              emp.description AS manager_description,

              emp.experience,

              emp.location AS manager_location,

              emp.rating,

              u.name AS manager_name,

              u.email AS manager_email,

              b.booking_id


            FROM proposals p


            JOIN event_manager_profiles emp

              ON
                p.manager_id =
                emp.manager_id


            JOIN users u

              ON
                emp.user_id =
                u.user_id


            LEFT JOIN bookings b

              ON
                b.proposal_id =
                p.proposal_id


            WHERE
              p.requirement_id = ?


            ORDER BY
              p.price ASC
          `,
          [
            requirementId
          ]
        );


      return sendRows(
        res,
        proposals
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load requirement proposals',
        error
      );

    }

  }
);


/*
  Manager open requirements
*/

app.get(
  '/api/manager/open-requirements',
  requireAuth,
  requireRole(
    'EVENT_MANAGER'
  ),
  async (
    req,
    res
  ) => {

    try {

      const manager =
        await getManagerProfile(
          req.auth.user_id
        );


      if (!manager) {

        return res
          .status(404)
          .json({
            message:
              'Manager profile not found'
          });

      }


      const requirements =
        await query(
          `
            SELECT

              er.*,

              e.event_name,

              u.name AS customer_name,

              (

                SELECT
                  COUNT(*)

                FROM proposals p1

                WHERE
                  p1.requirement_id =
                  er.requirement_id

              ) AS proposal_count,

              (

                SELECT
                  COUNT(*)

                FROM proposals p2

                WHERE

                  p2.requirement_id =
                  er.requirement_id

                  AND

                  p2.manager_id =
                  ?

              ) AS my_proposal_count


            FROM event_requirements er


            JOIN events e

              ON
                er.event_id =
                e.event_id


            JOIN users u

              ON
                er.customer_id =
                u.user_id


            WHERE

              er.status IN
              (
                'OPEN',
                'PROPOSALS_RECEIVED'
              )
                -- AND er.customer_id <> ?


            ORDER BY
              er.created_at DESC
          `,
          [
            manager.manager_id,
            req.auth.user_id
          ]
        );


      return sendRows(
        res,
        requirements
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load open requirements',
        error
      );

    }

  }
);


/*
  Create proposal
*/

app.post(
  '/api/proposals',
  requireAuth,
  requireRole(
    'EVENT_MANAGER'
  ),
  async (
    req,
    res
  ) => {

    try {

      const manager =
        await getManagerProfile(
          req.auth.user_id
        );


      if (
        !manager ||
        upper(
          manager.status
        ) !==
        'ACTIVE'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Active manager profile required'
          });

      }


      const requirementId =
        int(
          req.body.requirement_id ||
          req.body.requirementId
        );


      const packageName =
        text(
          req.body.package_name ||
          req.body.packageName
        );


      const description =
        text(
          req.body.description
        );


      const price =
        num(
          req.body.price
        );


      if (
        !requirementId ||
        !packageName ||
        !price ||
        price <= 0
      ) {

        return res
          .status(400)
          .json({

            message:
              'requirement_id, package_name and price are required'

          });

      }


      const requirement =
        await one(
          `
            SELECT *

            FROM event_requirements

            WHERE
              requirement_id = ?
          `,
          [
            requirementId
          ]
        );


      if (!requirement) {

        return res
          .status(404)
          .json({
            message:
              'Requirement not found'
          });

      }


      if (
        Number(
          requirement.customer_id
        ) ===
        Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(400)
          .json({
            message:
              'You cannot bid on your own requirement'
          });

      }


      if (
        ![
          'OPEN',
          'PROPOSALS_RECEIVED'
        ].includes(
          upper(
            requirement.status
          )
        )
      ) {

        return res
          .status(409)
          .json({
            message:
              'This requirement is no longer accepting proposals'
          });

      }


      const duplicate =
        await one(
          `
            SELECT proposal_id

            FROM proposals

            WHERE

              requirement_id = ?

              AND manager_id = ?

              AND status = 'SUBMITTED'
          `,
          [
            requirementId,
            manager.manager_id
          ]
        );


      if (duplicate) {

        return res
          .status(409)
          .json({
            message:
              'You already have a submitted proposal for this requirement'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO proposals
            (
              requirement_id,
              manager_id,
              package_name,
              description,
              price,
              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            requirementId,

            manager.manager_id,

            packageName,

            description,

            price,

            'SUBMITTED'

          ]
        );


      await query(
        `
          UPDATE event_requirements

          SET
            status = 'PROPOSALS_RECEIVED'

          WHERE

            requirement_id = ?

            AND status = 'OPEN'
        `,
        [
          requirementId
        ]
      );


      
      try {
        const reqRow = await one("SELECT customer_id, requirement_title FROM event_requirements WHERE requirement_id = ?", [requirementId]);
        if (reqRow && reqRow.customer_id) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [reqRow.customer_id, 'New Proposal Received', 'A manager has submitted a new proposal for your requirement "' + (reqRow.requirement_title || 'Event') + '".', 'proposals.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res
        .status(201)
        .json({

          message:
            'Proposal submitted successfully',

          proposal_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to submit proposal',
        error
      );

    }

  }
);


/*
  Update proposal
*/

app.put(
  '/api/proposals/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const proposalId =
        int(
          req.params.id
        );


      const proposal =
        await one(
          `
            SELECT *

            FROM proposals

            WHERE
              proposal_id = ?
          `,
          [
            proposalId
          ]
        );


      if (!proposal) {

        return res
          .status(404)
          .json({
            message:
              'Proposal not found'
          });

      }


      if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        if (
          !manager ||
          Number(
            manager.manager_id
          ) !==
          Number(
            proposal.manager_id
          )
        ) {

          return res
            .status(403)
            .json({
              message:
                'You do not have access to this proposal'
            });

        }

      }
      else if (
        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      await query(
        `
          UPDATE proposals

          SET

            package_name = ?,

            description = ?,

            price = ?

          WHERE
            proposal_id = ?
        `,
        [

          text(
            req.body.package_name ||
            req.body.packageName,
            proposal.package_name
          ),

          text(
            req.body.description,
            proposal.description
          ),

          Number(
            req.body.price ??
            proposal.price
          ),

          proposalId

        ]
      );


      return res.json({
        message:
          'Proposal updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update proposal',
        error
      );

    }

  }
);


/*
  Withdraw proposal
*/

app.put(
  '/api/proposals/:id/withdraw',
  requireAuth,
  requireRole(
    'EVENT_MANAGER'
  ),
  async (
    req,
    res
  ) => {

    try {

      const proposalId =
        int(
          req.params.id
        );


      const manager =
        await getManagerProfile(
          req.auth.user_id
        );


      const proposal =
        await one(
          `
            SELECT *

            FROM proposals

            WHERE
              proposal_id = ?
          `,
          [
            proposalId
          ]
        );


      if (
        !proposal ||
        !manager ||
        Number(
          proposal.manager_id
        ) !==
        Number(
          manager.manager_id
        )
      ) {

        return res
          .status(404)
          .json({
            message:
              'Proposal not found'
          });

      }


      if (
        proposal.status !==
        'SUBMITTED'
      ) {

        return res
          .status(400)
          .json({
            message:
              'Only submitted proposals can be withdrawn'
          });

      }


      await query(
        `
          UPDATE proposals

          SET
            status = 'WITHDRAWN'

          WHERE
            proposal_id = ?
        `,
        [
          proposalId
        ]
      );


      return res.json({
        message:
          'Proposal withdrawn successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to withdraw proposal',
        error
      );

    }

  }
);


/*
  Proposal Selection
  IMPORTANT EVENTFLOW STEP:
  customer selects one proposal
  -> proposal ACCEPTED
  -> other submitted proposals REJECTED
  -> requirement MANAGER_SELECTED
  -> booking created
*/

async function selectProposalHandler(
  req,
  res
) {

  const connection =
    await db.getConnection();


  try {

    const proposalId =
      int(
        req.params.id
      );


    if (!proposalId) {

      return res
        .status(400)
        .json({
          message:
            'Invalid proposal id'
        });

    }


    await connection.beginTransaction();


    const proposal =
      await one(
        `
          SELECT

            p.*,

            er.customer_id,

            er.event_id,

            er.event_date,

            er.event_end_date,

            er.guest_count,

            er.location,

            er.status AS requirement_status,

            e.event_name


          FROM proposals p


          JOIN event_requirements er

            ON
              p.requirement_id =
              er.requirement_id


          JOIN events e

            ON
              er.event_id =
              e.event_id


          WHERE
            p.proposal_id = ?

          FOR UPDATE
        `,
        [
          proposalId
        ],
        connection
      );


    if (!proposal) {

      await connection.rollback();

      return res
        .status(404)
        .json({
          message:
            'Proposal not found'
        });

    }


    if (
      Number(
        proposal.customer_id
      ) !==
      Number(
        req.auth.user_id
      )
    ) {

      await connection.rollback();

      return res
        .status(403)
        .json({
          message:
            'You do not have access to this proposal'
        });

    }


    if (
      proposal.status !==
      'SUBMITTED'
    ) {

      await connection.rollback();

      return res
        .status(409)
        .json({

          message:
            `This proposal is already ${String(proposal.status).toLowerCase()}`

        });

    }


    if (
      proposal.requirement_status ===
      'MANAGER_SELECTED'
    ) {

      await connection.rollback();

      return res
        .status(409)
        .json({
          message:
            'A manager has already been selected for this requirement'
        });

    }


    const existingBooking =
      await one(
        `
          SELECT
            booking_id

          FROM bookings

          WHERE
            proposal_id = ?
        `,
        [
          proposalId
        ],
        connection
      );


    if (existingBooking) {

      await connection.rollback();

      return res
        .status(409)
        .json({

          message:
            'A booking already exists for this proposal',

          booking_id:
            existingBooking.booking_id

        });

    }


    await query(
      `
        UPDATE proposals

        SET
          status = 'ACCEPTED'

        WHERE
          proposal_id = ?
      `,
      [
        proposalId
      ],
      connection
    );


    await query(
      `
        UPDATE proposals

        SET
          status = 'REJECTED'

        WHERE

          requirement_id = ?

          AND proposal_id <> ?

          AND status = 'SUBMITTED'
      `,
      [
        proposal.requirement_id,
        proposalId
      ],
      connection
    );


    await query(
      `
        UPDATE event_requirements

        SET
          status = 'MANAGER_SELECTED'

        WHERE
          requirement_id = ?
      `,
      [
        proposal.requirement_id
      ],
      connection
    );


    const [
      bookingResult
    ] =
      await connection.execute(
        `
          INSERT INTO bookings
          (
            customer_id,

            manager_id,

            proposal_id,

            event_id,

            event_name,

            event_date,

            event_end_date,

            guest_count,

            location,

            estimated_amount,

            final_amount,

            selected_services,

            service_customizations,

            status

          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,
        [

          proposal.customer_id,

          proposal.manager_id,

          proposal.proposal_id,

          proposal.event_id,

          proposal.event_name,

          proposal.event_date,

          proposal.event_end_date,

          proposal.guest_count,

          proposal.location,

          Number(
            proposal.price
          ),

          Number(
            proposal.price
          ),

          '[]',

          '{}',

          'PENDING'

        ]
      );


    await connection.commit();


    const booking =
      await getFullBooking(
        bookingResult.insertId
      );


    return res.json({

      message:
        'Proposal selected successfully and booking created',

      proposal_id:
        proposalId,

      booking_id:
        bookingResult.insertId,

      proposal:
        aliases(proposal),

      booking:
        aliases(booking)

    });


  } catch (error) {

    try {

      await connection.rollback();

    } catch (_) {}


    return sendError(
      res,
      'Failed to select proposal',
      error
    );


  } finally {

    connection.release();

  }

}


app.put(
  '/api/proposals/:id/select',
  requireAuth,
  requireRole(
    'CUSTOMER'
  ),
  selectProposalHandler
);


app.post(
  '/api/proposals/:id/select',
  requireAuth,
  requireRole(
    'CUSTOMER'
  ),
  selectProposalHandler
);


/* =========================================================
   BOOKINGS
========================================================= */


/*
  Get bookings
  Automatically filtered by logged-in user
*/

app.get(
  '/api/bookings',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const baseQuery = `
        SELECT

          
          b.*,
          COALESCE(p.price, b.final_amount) AS final_amount,
          COALESCE(er.requirement_title, b.event_name) AS event_name,

          e.event_name AS event_type,

          emp.business_name,

          u.name AS manager_name,

          p.package_name,

          p.price AS proposal_price,


          COALESCE(

            (
              SELECT
                SUM(pm.amount)

              FROM payments pm

              WHERE

                pm.booking_id =
                b.booking_id

                AND

                pm.status =
                'SUCCESS'

            ),

            0

          ) AS amount_paid


        FROM bookings b


        JOIN events e

          ON
            b.event_id =
            e.event_id


        JOIN event_manager_profiles emp

          ON
            b.manager_id =
            emp.manager_id


        JOIN users u

          ON
            emp.user_id =
            u.user_id


        LEFT JOIN proposals p
        ON
          b.proposal_id =
          p.proposal_id

      LEFT JOIN event_requirements er
        ON p.requirement_id = er.requirement_id
      `;


      let bookings;


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        bookings =
          await query(
            baseQuery +
            `
              WHERE
                b.customer_id = ?

              ORDER BY
                b.created_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        if (!manager) {

          return res
            .status(404)
            .json({
              message:
                'Manager profile not found'
            });

        }


        bookings =
          await query(
            baseQuery +
            `
              WHERE
                b.manager_id = ?

              ORDER BY
                b.created_at DESC
            `,
            [
              manager.manager_id
            ]
          );

      }

      else {

        bookings =
          await query(
            baseQuery +
            `
              ORDER BY
                b.created_at DESC
            `
          );

      }


      return sendRows(
        res,
        bookings
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load bookings',
        error
      );

    }

  }
);


/*
  Customer bookings
*/

app.get(
  '/api/customers/:customer_id/bookings',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let customerId =
        int(
          req.params.customer_id
        );


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        customerId =
          Number(
            req.auth.user_id
          );

      }


      if (
        req.auth.role !==
        'CUSTOMER' &&
        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      const bookings =
        await query(
          `
            SELECT b.*, m.business_name as manager_name, COALESCE(p.price, b.final_amount) AS final_amount, COALESCE(er.requirement_title, b.event_name) AS event_name FROM bookings b LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id LEFT JOIN event_manager_profiles m ON b.manager_id = m.manager_id WHERE b.customer_id = ? ORDER BY b.created_at DESC
          `,
          [customerId]
        );


      return sendRows(
        res,
        bookings
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer bookings',
        error
      );

    }

  }
);


/*
  Single booking
*/

app.get(
  '/api/bookings/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const booking =
        await getFullBooking(
          bookingId
        );


      return res.json(
        aliases(booking)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load booking',
        error
      );

    }

  }
);


/*
  Create booking manually
  Admin only
*/

app.post(
  '/api/bookings',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const customerId =
        int(
          req.body.customer_id ||
          req.body.customerId
        );


      const managerId =
        int(
          req.body.manager_id ||
          req.body.managerId
        );


      const eventId =
        int(
          req.body.event_id ||
          req.body.eventId
        );


      const eventDate =
        text(
          req.body.event_date ||
          req.body.eventDate ||
          req.body.date
        );


      const guestCount =
        int(
          req.body.guest_count ||
          req.body.guestCount
        );


      if (
        !customerId ||
        !managerId ||
        !eventId ||
        !eventDate ||
        !guestCount
      ) {

        return res
          .status(400)
          .json({

            message:
              'customer_id, manager_id, event_id, event_date and guest_count are required'

          });

      }


      const event =
        await one(
          `
            SELECT
              event_name

            FROM events

            WHERE
              event_id = ?
          `,
          [eventId]
        );


      if (!event) {

        return res
          .status(404)
          .json({
            message:
              'Event not found'
          });

      }


      const amount =
        num(
          req.body.final_amount ||
          req.body.finalAmount ||
          req.body.amount
        ) || 0;


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO bookings
            (
              customer_id,

              manager_id,

              event_id,

              event_name,

              event_date,

              event_end_date,

              guest_count,

              location,

              estimated_amount,

              final_amount,

              selected_services,

              service_customizations,

              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            customerId,

            managerId,

            eventId,

            event.event_name,

            eventDate,

            text(
              req.body.event_end_date ||
              req.body.eventEndDate
            ),

            guestCount,

            text(
              req.body.location ||
              req.body.city
            ),

            amount,

            amount,

            '[]',

            '{}',

            upper(
              req.body.status,
              'PENDING'
            )

          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Booking created successfully',

          booking_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to create booking',
        error
      );

    }

  }
);


/*
  Update booking
*/

app.put(
  '/api/bookings/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const current =
        access.booking;


      await query(
        `
          UPDATE bookings

          SET

            event_date = ?,

            event_end_date = ?,

            guest_count = ?,

            location = ?,

            final_amount = ?,

            selected_services = ?,

            service_customizations = ?

          WHERE
            booking_id = ?
        `,
        [

          text(
            req.body.event_date ||
            req.body.eventDate,
            current.event_date
          ),

          text(
            req.body.event_end_date ||
            req.body.eventEndDate,
            current.event_end_date
          ),

          int(
            req.body.guest_count ||
            req.body.guestCount
          ) ||
          current.guest_count,

          text(
            req.body.location ||
            req.body.city,
            current.location
          ),

          Number(
            req.body.final_amount ??
            req.body.finalAmount ??
            current.final_amount
          ),

          typeof req.body.selected_services ===
          'string'

            ? req.body.selected_services

            : JSON.stringify(
                req.body.selected_services ??
                []
              ),

          typeof req.body.service_customizations ===
          'string'

            ? req.body.service_customizations

            : JSON.stringify(
                req.body.service_customizations ??
                {}
              ),

          bookingId

        ]
      );


      return res.json({
        message:
          'Booking updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update booking',
        error
      );

    }

  }
);


/*
  Booking status
*/

app.put(
  '/api/bookings/:id/status',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const status =
        upper(
          req.body.status
        );


      if (
        ![
          'PENDING',
          'CONFIRMED',
          'IN_PROGRESS',
          'COMPLETED',
          'CANCELLED',
          'REJECTED'
        ].includes(status)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid booking status'
          });

      }


      const completedAt =
        status === 'COMPLETED'
          ? new Date()
          : null;


      const cancelledAt =
        status === 'CANCELLED'
          ? new Date()
          : null;


      await query(
        `
          UPDATE bookings

          SET

            status = ?,

            completed_at = ?,

            cancelled_at = ?,

            cancellation_reason = ?

          WHERE
            booking_id = ?
        `,
        [

          status,

          completedAt,

          cancelledAt,

          text(
            req.body.cancellation_reason ||
            req.body.cancellationReason
          ),

          bookingId

        ]
      );


      return res.json({
        message:
          'Booking status updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update booking status',
        error
      );

    }

  }
);


/*
  Cancel booking
*/

app.put(
  '/api/bookings/:id/cancel',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      await query(
        `
          UPDATE bookings

          SET

            status = 'CANCELLED',

            cancelled_at = NOW(),

            cancellation_reason = ?

          WHERE
            booking_id = ?
        `,
        [

          text(
            req.body.reason ||
            req.body.cancellation_reason ||
            req.body.cancellationReason
          ),

          bookingId

        ]
      );


      return res.json({
        message:
          'Booking cancelled successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to cancel booking',
        error
      );

    }

  }
);


/* =========================================================
   GUESTS
========================================================= */

app.get(
  '/api/guests',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let guests;


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        guests =
          await query(
            `
              SELECT

                g.*


              FROM guests g


              JOIN bookings b

                ON
                  g.booking_id =
                  b.booking_id


              WHERE
                b.customer_id = ?


              ORDER BY
                g.guest_id DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else if (
        req.auth.role ===
        'EVENT_MANAGER'
      ) {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        guests =
          manager

            ? await query(
                `
                  SELECT

                    g.*


                  FROM guests g


                  JOIN bookings b

                    ON
                      g.booking_id =
                      b.booking_id


                  WHERE
                    b.manager_id = ?


                  ORDER BY
                    g.guest_id DESC
                `,
                [
                  manager.manager_id
                ]
              )

            : [];

      }

      else {

        guests =
          await query(
            `
              SELECT *

              FROM guests

              ORDER BY
                guest_id DESC
            `
          );

      }


      return sendRows(
        res,
        guests
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load guests',
        error
      );

    }

  }
);


app.get(
  '/api/bookings/:booking_id/guests',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.booking_id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const guests =
        await query(
          `
            SELECT *

            FROM guests

            WHERE
              booking_id = ?

            ORDER BY
              guest_id
          `,
          [
            bookingId
          ]
        );


      return sendRows(
        res,
        guests
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load booking guests',
        error
      );

    }

  }
);


app.get(
  '/api/guests/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const guestId =
        int(
          req.params.id
        );


      const guest =
        await one(
          `
            SELECT *

            FROM guests

            WHERE guest_id = ?
          `,
          [
            guestId
          ]
        );


      if (!guest) {

        return res
          .status(404)
          .json({
            message:
              'Guest not found'
          });

      }


      const access =
        await canAccessBooking(
          guest.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this guest'
          });

      }


      return res.json(
        aliases(guest)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load guest',
        error
      );

    }

  }
);


app.post(
  '/api/guests',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.body.booking_id ||
          req.body.bookingId
        );


      const guestName =
        text(
          req.body.name
        );


      if (
        !bookingId ||
        !guestName
      ) {

        return res
          .status(400)
          .json({
            message:
              'booking_id and name are required'
          });

      }


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO guests
            (
              booking_id,

              name,

              phone,

              email,

              guest_type,

              rsvp_status,

              special_requirements
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            bookingId,

            guestName,

            text(
              req.body.phone
            ),

            text(
              req.body.email
            ),

            upper(
              req.body.guest_type ||
              req.body.guestType,
              'ADULT'
            ),

            upper(
              req.body.rsvp_status ||
              req.body.rsvp,
              'PENDING'
            ),

            text(
              req.body.special_requirements ||
              req.body.specialRequirements
            )

          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Guest added successfully',

          guest_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to add guest',
        error
      );

    }

  }
);


app.put(
  '/api/guests/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const guestId =
        int(
          req.params.id
        );


      const guest =
        await one(
          `
            SELECT *

            FROM guests

            WHERE guest_id = ?
          `,
          [
            guestId
          ]
        );


      if (!guest) {

        return res
          .status(404)
          .json({
            message:
              'Guest not found'
          });

      }


      const access =
        await canAccessBooking(
          guest.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this guest'
          });

      }


      await query(
        `
          UPDATE guests

          SET

            name = ?,

            phone = ?,

            email = ?,

            guest_type = ?,

            rsvp_status = ?,

            special_requirements = ?

          WHERE
            guest_id = ?
        `,
        [

          text(
            req.body.name,
            guest.name
          ),

          text(
            req.body.phone,
            guest.phone
          ),

          text(
            req.body.email,
            guest.email
          ),

          upper(
            req.body.guest_type ||
            req.body.guestType,
            guest.guest_type
          ),

          upper(
            req.body.rsvp_status ||
            req.body.rsvp,
            guest.rsvp_status
          ),

          text(
            req.body.special_requirements ||
            req.body.specialRequirements,
            guest.special_requirements
          ),

          guestId

        ]
      );


      return res.json({
        message:
          'Guest updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update guest',
        error
      );

    }

  }
);


app.put(
  '/api/guests/:id/rsvp',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const guestId =
        int(
          req.params.id
        );


      const guest =
        await one(
          `
            SELECT *

            FROM guests

            WHERE guest_id = ?
          `,
          [
            guestId
          ]
        );


      if (!guest) {

        return res
          .status(404)
          .json({
            message:
              'Guest not found'
          });

      }


      const access =
        await canAccessBooking(
          guest.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this guest'
          });

      }


      const rsvp =
        upper(
          req.body.rsvp_status ||
          req.body.rsvp
        );


      if (
        ![
          'PENDING',
          'CONFIRMED',
          'DECLINED'
        ].includes(rsvp)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid RSVP status'
          });

      }


      await query(
        `
          UPDATE guests

          SET
            rsvp_status = ?

          WHERE
            guest_id = ?
        `,
        [
          rsvp,
          guestId
        ]
      );


      return res.json({
        message:
          'Guest RSVP updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update RSVP',
        error
      );

    }

  }
);


app.delete(
  '/api/guests/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const guestId =
        int(
          req.params.id
        );


      const guest =
        await one(
          `
            SELECT *

            FROM guests

            WHERE guest_id = ?
          `,
          [
            guestId
          ]
        );


      if (!guest) {

        return res
          .status(404)
          .json({
            message:
              'Guest not found'
          });

      }


      const access =
        await canAccessBooking(
          guest.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this guest'
          });

      }


      await query(
        `
          DELETE FROM guests

          WHERE guest_id = ?
        `,
        [
          guestId
        ]
      );


      return res.json({
        message:
          'Guest deleted successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to delete guest',
        error
      );

    }

  }
);


/* =========================================================
   TASKS
========================================================= */

app.get(
  '/api/tasks',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let tasks;


      if (
        req.auth.role ===
        'ADMIN'
      ) {

        tasks =
          await query(
            `
              SELECT *

              FROM tasks

              ORDER BY
                task_id DESC
            `
          );

      }

      else if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        tasks =
          await query(
            `
              SELECT
                t.*

              FROM tasks t


              JOIN bookings b

                ON
                  t.booking_id =
                  b.booking_id


              WHERE
                b.customer_id = ?


              ORDER BY
                t.task_id DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        tasks =
          manager

            ? await query(
                `
                  SELECT
                    t.*

                  FROM tasks t


                  JOIN bookings b

                    ON
                      t.booking_id =
                      b.booking_id


                  WHERE
                    b.manager_id = ?


                  ORDER BY
                    t.task_id DESC
                `,
                [
                  manager.manager_id
                ]
              )

            : [];

      }


      return sendRows(
        res,
        tasks
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load tasks',
        error
      );

    }

  }
);


/*
  Booking tasks

  Also supports current dashboard call:
  /api/bookings/1/tasks

  If customer has no access to booking 1,
  backend uses the latest booking for that customer.
*/

app.get(
  '/api/bookings/:booking_id/tasks',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let bookingId =
        int(
          req.params.booking_id
        );


      let access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (
        !access.allowed &&
        req.auth.role ===
        'CUSTOMER'
      ) {

        const latest =
          await one(
            `
              SELECT
                booking_id

              FROM bookings

              WHERE
                customer_id = ?

              ORDER BY
                created_at DESC

              LIMIT 1
            `,
            [
              req.auth.user_id
            ]
          );


        if (latest) {

          bookingId =
            latest.booking_id;


          access =
            await canAccessBooking(
              bookingId,
              req.auth
            );

        }

      }


      if (!access.allowed) {

        return res
          .status(
            access.status || 404
          )
          .json({

            message:
              'No accessible booking found for tasks'

          });

      }


      const tasks =
        await query(
          `
            SELECT *

            FROM tasks

            WHERE
              booking_id = ?

            ORDER BY
              task_id
          `,
          [
            bookingId
          ]
        );


      return sendRows(
        res,
        tasks
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load booking tasks',
        error
      );

    }

  }
);


app.get(
  '/api/tasks/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const taskId =
        int(
          req.params.id
        );


      const task =
        await one(
          `
            SELECT *

            FROM tasks

            WHERE task_id = ?
          `,
          [
            taskId
          ]
        );


      if (!task) {

        return res
          .status(404)
          .json({
            message:
              'Task not found'
          });

      }


      const access =
        await canAccessBooking(
          task.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this task'
          });

      }


      return res.json(
        aliases(task)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load task',
        error
      );

    }

  }
);


app.post(
  '/api/tasks',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.body.booking_id ||
          req.body.bookingId
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Customers cannot create manager tasks'
          });

      }


      const taskName =
        text(
          req.body.task_name ||
          req.body.taskName
        );


      if (!taskName) {

        return res
          .status(400)
          .json({
            message:
              'task_name is required'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO tasks
            (
              booking_id,

              task_name,

              description,

              start_date,

              due_date,

              assigned_to,

              priority,

              status,

              created_by
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            bookingId,

            taskName,

            text(
              req.body.description
            ),

            text(
              req.body.start_date ||
              req.body.startDate
            ),

            text(
              req.body.due_date ||
              req.body.dueDate
            ),

            int(
              req.body.assigned_to ||
              req.body.assignedTo
            ),

            upper(
              req.body.priority,
              'MEDIUM'
            ),

            upper(
              req.body.status,
              'PENDING'
            ),

            req.auth.user_id

          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Task created successfully',

          task_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to create task',
        error
      );

    }

  }
);


/* Task update */

app.put(
  '/api/tasks/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const taskId =
        int(
          req.params.id
        );


      const task =
        await one(
          `
            SELECT *

            FROM tasks

            WHERE
              task_id = ?
          `,
          [
            taskId
          ]
        );


      if (!task) {

        return res
          .status(404)
          .json({
            message:
              'Task not found'
          });

      }


      const access =
        await canAccessBooking(
          task.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this task'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Customers cannot edit tasks'
          });

      }


      await query(
        `
          UPDATE tasks

          SET

            task_name = ?,

            description = ?,

            start_date = ?,

            due_date = ?,

            assigned_to = ?,

            priority = ?,

            status = ?

          WHERE
            task_id = ?
        `,
        [

          text(
            req.body.task_name ||
            req.body.taskName,
            task.task_name
          ),

          text(
            req.body.description,
            task.description
          ),

          text(
            req.body.start_date ||
            req.body.startDate,
            task.start_date
          ),

          text(
            req.body.due_date ||
            req.body.dueDate,
            task.due_date
          ),

          int(
            req.body.assigned_to ||
            req.body.assignedTo
          ) ||
          task.assigned_to,

          upper(
            req.body.priority,
            task.priority
          ),

          upper(
            req.body.status,
            task.status
          ),

          taskId

        ]
      );


      return res.json({
        message:
          'Task updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update task',
        error
      );

    }

  }
);


/* Task status */

app.put(
  '/api/tasks/:id/status',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const taskId =
        int(
          req.params.id
        );


      const status =
        upper(
          req.body.status
        );


      if (
        ![
          'PENDING',
          'IN_PROGRESS',
          'COMPLETED',
          'CANCELLED'
        ].includes(status)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid task status'
          });

      }


      const task =
        await one(
          `
            SELECT *

            FROM tasks

            WHERE task_id = ?
          `,
          [
            taskId
          ]
        );


      if (!task) {

        return res
          .status(404)
          .json({
            message:
              'Task not found'
          });

      }


      const access =
        await canAccessBooking(
          task.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this task'
          });

      }


      await query(
        `
          UPDATE tasks

          SET
            status = ?

          WHERE
            task_id = ?
        `,
        [
          status,
          taskId
        ]
      );


      return res.json({
        message:
          'Task status updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update task status',
        error
      );

    }

  }
);


/* Task delete */

app.delete(
  '/api/tasks/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const taskId =
        int(
          req.params.id
        );


      const task =
        await one(
          `
            SELECT *

            FROM tasks

            WHERE task_id = ?
          `,
          [
            taskId
          ]
        );


      if (!task) {

        return res
          .status(404)
          .json({
            message:
              'Task not found'
          });

      }


      const access =
        await canAccessBooking(
          task.booking_id,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this task'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Customers cannot delete tasks'
          });

      }


      await query(
        `
          DELETE FROM tasks

          WHERE
            task_id = ?
        `,
        [
          taskId
        ]
      );


      return res.json({
        message:
          'Task deleted successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to delete task',
        error
      );

    }

  }
);


/* =========================================================
   PAYMENTS
========================================================= */

app.get(
  '/api/payments',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let payments;


      if (
        req.auth.role ===
        'ADMIN'
      ) {

        payments =
          await query(
            `
              SELECT *

              FROM payments

              ORDER BY
                payment_date DESC
            `
          );

      }

      else if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        payments =
          await query(
            `
              SELECT *

              FROM payments

              WHERE
                customer_id = ?

              ORDER BY
                payment_date DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        payments =
          manager

            ? await query(
                `
                  SELECT

                    p.*


                  FROM payments p


                  JOIN bookings b

                    ON
                      p.booking_id =
                      b.booking_id


                  WHERE
                    b.manager_id = ?


                  ORDER BY
                    p.payment_date DESC
                `,
                [
                  manager.manager_id
                ]
              )

            : [];

      }


      return sendRows(
        res,
        payments
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load payments',
        error
      );

    }

  }
);


app.get(
  '/api/customers/:customer_id/payments',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let customerId =
        int(
          req.params.customer_id
        );


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        customerId =
          Number(
            req.auth.user_id
          );

      }


      if (
        req.auth.role !==
        'CUSTOMER' &&
        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      const payments =
        await query(
          `
            SELECT *

            FROM payments

            WHERE
              customer_id = ?

            ORDER BY
              payment_date DESC
          `,
          [
            customerId
          ]
        );


      return sendRows(
        res,
        payments
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer payments',
        error
      );

    }

  }
);


app.get(
  '/api/bookings/:booking_id/payments',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.booking_id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const payments =
        await query(
          `
            SELECT *

            FROM payments

            WHERE
              booking_id = ?

            ORDER BY
              payment_date DESC
          `,
          [
            bookingId
          ]
        );


      return sendRows(
        res,
        payments
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load booking payments',
        error
      );

    }

  }
);


app.get(
  '/api/payments/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const paymentId =
        int(
          req.params.id
        );


      const payment =
        await one(
          `
            SELECT *

            FROM payments

            WHERE
              payment_id = ?
          `,
          [
            paymentId
          ]
        );


      if (!payment) {

        return res
          .status(404)
          .json({
            message:
              'Payment not found'
          });

      }


      if (
        req.auth.role !==
        'ADMIN'
      ) {

        const access =
          await canAccessBooking(
            payment.booking_id,
            req.auth
          );


        if (!access.allowed) {

          return res
            .status(
              access.status
            )
            .json({
              message:
                'You do not have access to this payment'
            });

        }

      }


      return res.json(
        aliases(payment)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load payment',
        error
      );

    }

  }
);


/*
  Add payment
*/

app.post(
  '/api/payments',
  requireAuth,
  requireRole(
    'CUSTOMER',
    'ADMIN'
  ),
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.body.booking_id ||
          req.body.bookingId
        );


      const amount =
        num(
          req.body.amount
        );


      if (
        !bookingId ||
        !amount ||
        amount <= 0
      ) {

        return res
          .status(400)
          .json({
            message:
              'booking_id and a positive amount are required'
          });

      }


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const booking =
        await getFullBooking(
          bookingId
        );


      const amountPaid =
        Number(
          booking.amount_paid ||
          0
        );


      const total =
        Number(
          booking.final_amount ||
          booking.estimated_amount ||
          0
        );


      if (
        total > 0 &&
        amount >
        Math.max(
          total -
          amountPaid,
          0
        )
      ) {

        return res
          .status(400)
          .json({

            message:
              `Payment exceeds remaining balance of â‚¹${Math.max(total - amountPaid, 0).toLocaleString('en-IN')}`

          });

      }


      const customerId =
        req.auth.role ===
        'ADMIN'

          ? booking.customer_id

          : req.auth.user_id;


      const transactionId =
        text(
          req.body.transaction_id ||
          req.body.transactionId
        ) ||

        (
          'EF-' +
          Date.now() +
          '-' +
          crypto
            .randomBytes(3)
            .toString('hex')
            .toUpperCase()
        );


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO payments
            (
              booking_id,

              customer_id,

              amount,

              payment_type,

              payment_method,

              transaction_id,

              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            bookingId,

            customerId,

            amount,

            upper(
              req.body.payment_type ||
              req.body.paymentType,
              'INSTALLMENT'
            ),

            upper(
              req.body.payment_method ||
              req.body.paymentMethod,
              'UPI'
            ),

            transactionId,

            'SUCCESS'

          ]
        );


      await query(
        `
          UPDATE bookings

          SET

            status = CASE

              WHEN
                status = 'PENDING'

              THEN
                'CONFIRMED'

              ELSE
                status

            END

          WHERE
            booking_id = ?
        `,
        [
          bookingId
        ]
      );


      const payment =
        await one(
          `
            SELECT *

            FROM payments

            WHERE
              payment_id = ?
          `,
          [
            result.insertId
          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Payment recorded successfully',

          payment_id:
            result.insertId,

          id:
            result.insertId,

          transaction_id:
            transactionId,

          payment:
            aliases(payment)

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to record payment',
        error
      );

    }

  }
);


/*
  Payment status
*/

app.put(
  '/api/payments/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const paymentId =
        int(
          req.params.id
        );


      const status =
        upper(
          req.body.status
        );


      if (
        ![
          'PENDING',
          'SUCCESS',
          'FAILED',
          'REFUNDED'
        ].includes(status)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid payment status'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            UPDATE payments

            SET
              status = ?

            WHERE
              payment_id = ?
          `,
          [
            status,
            paymentId
          ]
        );


      if (
        !result.affectedRows
      ) {

        return res
          .status(404)
          .json({
            message:
              'Payment not found'
          });

      }


      return res.json({
        message:
          'Payment status updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update payment status',
        error
      );

    }

  }
);


/* =========================================================
   REFUNDS
========================================================= */

app.get(
  '/api/refunds',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let refunds;


      if (
        req.auth.role ===
        'ADMIN'
      ) {

        refunds =
          await query(
            `
              SELECT *

              FROM refunds

              ORDER BY
                requested_at DESC
            `
          );

      }

      else if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        refunds =
          await query(
            `
              SELECT *

              FROM refunds

              WHERE
                customer_id = ?

              ORDER BY
                requested_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        refunds =
          manager

            ? await query(
                `
                  SELECT
                    r.*

                  FROM refunds r


                  JOIN bookings b

                    ON
                      r.booking_id =
                      b.booking_id


                  WHERE
                    b.manager_id = ?


                  ORDER BY
                    r.requested_at DESC
                `,
                [
                  manager.manager_id
                ]
              )

            : [];

      }


      return sendRows(
        res,
        refunds
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load refunds',
        error
      );

    }

  }
);


app.get(
  '/api/customers/:customer_id/refunds',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let customerId =
        int(
          req.params.customer_id
        );


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        customerId =
          Number(
            req.auth.user_id
          );

      }


      if (
        req.auth.role !==
        'CUSTOMER' &&
        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      const refunds =
        await query(
          `
            SELECT *

            FROM refunds

            WHERE
              customer_id = ?

            ORDER BY
              requested_at DESC
          `,
          [
            customerId
          ]
        );


      return sendRows(
        res,
        refunds
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer refunds',
        error
      );

    }

  }
);


app.get(
  '/api/bookings/:booking_id/refunds',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.booking_id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const refunds =
        await query(
          `
            SELECT *

            FROM refunds

            WHERE
              booking_id = ?

            ORDER BY
              requested_at DESC
          `,
          [
            bookingId
          ]
        );


      return sendRows(
        res,
        refunds
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load booking refunds',
        error
      );

    }

  }
);


app.get(
  '/api/refunds/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const refundId =
        int(
          req.params.id
        );


      const refund =
        await one(
          `
            SELECT *

            FROM refunds

            WHERE
              refund_id = ?
          `,
          [
            refundId
          ]
        );


      if (!refund) {

        return res
          .status(404)
          .json({
            message:
              'Refund not found'
          });

      }


      if (
        req.auth.role !==
        'ADMIN'
      ) {

        const access =
          await canAccessBooking(
            refund.booking_id,
            req.auth
          );


        if (!access.allowed) {

          return res
            .status(
              access.status
            )
            .json({
              message:
                'You do not have access to this refund'
            });

        }

      }


      return res.json(
        aliases(refund)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load refund',
        error
      );

    }

  }
);


/*
  Request refund
*/

app.post(
  '/api/refunds',
  requireAuth,
  requireRole(
    'CUSTOMER',
    'ADMIN'
  ),
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.body.booking_id ||
          req.body.bookingId
        );


      const paymentId =
        int(
          req.body.payment_id ||
          req.body.paymentId
        );


      const amount =
        num(
          req.body.amount
        );


      if (
        !bookingId ||
        !paymentId ||
        !amount
      ) {

        return res
          .status(400)
          .json({

            message:
              'booking_id, payment_id and amount are required'

          });

      }


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const payment =
        await one(
          `
            SELECT *

            FROM payments

            WHERE

              payment_id = ?

              AND booking_id = ?
          `,
          [
            paymentId,
            bookingId
          ]
        );


      if (!payment) {

        return res
          .status(404)
          .json({
            message:
              'Payment not found'
          });

      }


      if (
        amount >
        Number(
          payment.amount
        )
      ) {

        return res
          .status(400)
          .json({
            message:
              'Refund cannot exceed the payment amount'
          });

      }


      const customerId =
        req.auth.role ===
        'ADMIN'

          ? access.booking.customer_id

          : req.auth.user_id;


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO refunds
            (
              booking_id,

              payment_id,

              customer_id,

              amount,

              reason,

              requested_by,

              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            bookingId,

            paymentId,

            customerId,

            amount,

            text(
              req.body.reason,
              'OTHER'
            ),

            req.auth.user_id,

            'REQUESTED'

          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Refund request created successfully',

          refund_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to create refund',
        error
      );

    }

  }
);


/*
  Refund status
*/

app.put(
  '/api/refunds/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const refundId =
        int(
          req.params.id
        );


      const status =
        upper(
          req.body.status
        );


      if (
        ![
          'REQUESTED',
          'APPROVED',
          'REJECTED',
          'PROCESSING',
          'COMPLETED'
        ].includes(status)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid refund status'
          });

      }


      const refund =
        await one(
          `
            SELECT *

            FROM refunds

            WHERE
              refund_id = ?
          `,
          [
            refundId
          ]
        );


      if (!refund) {

        return res
          .status(404)
          .json({
            message:
              'Refund not found'
          });

      }


      const approvedBy =
        [
          'APPROVED',
          'PROCESSING',
          'COMPLETED'
        ].includes(status)

          ? req.auth.user_id

          : null;


      const processedAt =
        status ===
        'COMPLETED'

          ? new Date()

          : refund.processed_at;


      const transactionId =
        text(
          req.body.refund_transaction_id ||
          req.body.refundTransactionId
        ) ||
        refund.refund_transaction_id ||
        null;


      await query(
        `
          UPDATE refunds

          SET

            status = ?,

            approved_by = ?,

            processed_at = ?,

            refund_transaction_id = ?

          WHERE
            refund_id = ?
        `,
        [

          status,

          approvedBy,

          processedAt,

          transactionId,

          refundId

        ]
      );


      return res.json({
        message:
          'Refund status updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update refund status',
        error
      );

    }

  }
);


/* =========================================================
   SUPPORT TICKETS
========================================================= */

app.get(
  '/api/tickets',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let tickets;


      if (
        req.auth.role ===
        'ADMIN'
      ) {

        tickets =
          await query(
            `
              SELECT *

              FROM support_tickets

              ORDER BY
                created_at DESC
            `
          );

      }

      else if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        tickets =
          await query(
            `
              SELECT *

              FROM support_tickets

              WHERE
                customer_id = ?

              ORDER BY
                created_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        tickets =
          manager

            ? await query(
                `
                  SELECT

                    st.*

                  FROM support_tickets st


                  JOIN bookings b

                    ON
                      st.booking_id =
                      b.booking_id


                  WHERE
                    b.manager_id = ?


                  ORDER BY
                    st.created_at DESC
                `,
                [
                  manager.manager_id
                ]
              )

            : [];

      }


      return sendRows(
        res,
        tickets
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load tickets',
        error
      );

    }

  }
);


/*
  Single ticket
*/

app.get(
  '/api/tickets/:id',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const ticketId =
        int(
          req.params.id
        );


      const ticket =
        await one(
          `
            SELECT *

            FROM support_tickets

            WHERE
              ticket_id = ?
          `,
          [
            ticketId
          ]
        );


      if (!ticket) {

        return res
          .status(404)
          .json({
            message:
              'Ticket not found'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER' &&

        Number(
          ticket.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this ticket'
          });

      }


      return res.json(
        aliases(ticket)
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load ticket',
        error
      );

    }

  }
);


/*
  Customer tickets
*/

app.get(
  '/api/customers/:customer_id/tickets',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let customerId =
        int(
          req.params.customer_id
        );


      if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        customerId =
          Number(
            req.auth.user_id
          );

      }


      if (
        req.auth.role !==
        'CUSTOMER' &&
        req.auth.role !==
        'ADMIN'
      ) {

        return res
          .status(403)
          .json({
            message:
              'Not allowed'
          });

      }


      const tickets =
        await query(
          `
            SELECT *

            FROM support_tickets

            WHERE
              customer_id = ?

            ORDER BY
              created_at DESC
          `,
          [
            customerId
          ]
        );


      return sendRows(
        res,
        tickets
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer tickets',
        error
      );

    }

  }
);


/*
  Create ticket
*/

app.post(
  '/api/tickets',
  requireAuth,
  requireRole(
    'CUSTOMER'
  ),
  async (
    req,
    res
  ) => {

    try {

      const subject =
        text(
          req.body.subject ||
          req.body.title
        );


      const description =
        text(
          req.body.description ||
          req.body.message
        );


      const bookingId =
        int(
          req.body.booking_id ||
          req.body.bookingId
        );


      if (!subject) {

        return res
          .status(400)
          .json({
            message:
              'Subject is required'
          });

      }


      if (bookingId) {

        const access =
          await canAccessBooking(
            bookingId,
            req.auth
          );


        if (!access.allowed) {

          return res
            .status(
              access.status
            )
            .json({
              message:
                'You do not have access to this booking'
            });

        }

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO support_tickets
            (
              customer_id,

              booking_id,

              subject,

              description,

              priority,

              status
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            req.auth.user_id,

            bookingId,

            subject,

            description,

            upper(
              req.body.priority,
              'MEDIUM'
            ),

            'OPEN'

          ]
        );


      return res
        .status(201)
        .json({

          message:
            'Support ticket created successfully',

          ticket_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to create ticket',
        error
      );

    }

  }
);


/*
  Ticket status
*/

app.put(
  '/api/tickets/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const ticketId =
        int(
          req.params.id
        );


      const status =
        upper(
          req.body.status
        );


      if (
        ![
          'OPEN',
          'IN_PROGRESS',
          'RESOLVED',
          'CLOSED'
        ].includes(status)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid ticket status'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            UPDATE support_tickets

            SET
              status = ?

            WHERE
              ticket_id = ?
          `,
          [
            status,
            ticketId
          ]
        );


      if (
        !result.affectedRows
      ) {

        return res
          .status(404)
          .json({
            message:
              'Ticket not found'
          });

      }


      return res.json({
        message:
          'Ticket status updated successfully'
      });


    } catch (error) {

      return sendError(
        res,
        'Failed to update ticket status',
        error
      );

    }

  }
);


/*
  Ticket messages
*/

app.get(
  '/api/tickets/:ticket_id/messages',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const ticketId =
        int(
          req.params.ticket_id
        );


      const ticket =
        await one(
          `
            SELECT *

            FROM support_tickets

            WHERE
              ticket_id = ?
          `,
          [
            ticketId
          ]
        );


      if (!ticket) {

        return res
          .status(404)
          .json({
            message:
              'Ticket not found'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER' &&

        Number(
          ticket.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this ticket'
          });

      }


      const messages =
        await query(
          `
            SELECT

              tm.*,

              u.name AS sender_name


            FROM ticket_messages tm


            JOIN users u

              ON
                tm.sender_id =
                u.user_id


            WHERE
              tm.ticket_id = ?


            ORDER BY
              tm.created_at
          `,
          [
            ticketId
          ]
        );


      return sendRows(
        res,
        messages
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load ticket messages',
        error
      );

    }

  }
);


app.post(
  '/api/tickets/:ticket_id/messages',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const ticketId =
        int(
          req.params.ticket_id
        );


      const message =
        text(
          req.body.message
        );


      if (!message) {

        return res
          .status(400)
          .json({
            message:
              'Message is required'
          });

      }


      const ticket =
        await one(
          `
            SELECT *

            FROM support_tickets

            WHERE
              ticket_id = ?
          `,
          [
            ticketId
          ]
        );


      if (!ticket) {

        return res
          .status(404)
          .json({
            message:
              'Ticket not found'
          });

      }


      if (
        req.auth.role ===
        'CUSTOMER' &&

        Number(
          ticket.customer_id
        ) !== Number(
          req.auth.user_id
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              'You do not have access to this ticket'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO
            ticket_messages
            (
              ticket_id,

              sender_id,

              message
            )

            VALUES
            (
              ?,
              ?,
              ?
            )
          `,
          [
            ticketId,

            req.auth.user_id,

            message

          ]
        );


      await query(
        `
          UPDATE support_tickets

          SET

            status = CASE

              WHEN
                status = 'OPEN'

              THEN
                'IN_PROGRESS'

              ELSE
                status

            END

          WHERE
            ticket_id = ?
        `,
        [
          ticketId
        ]
      );


      return res
        .status(201)
        .json({

          message:
            'Message sent successfully',

          message_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to send ticket message',
        error
      );

    }

  }
);


/* =========================================================
   FEEDBACK
========================================================= */

app.get(
  '/api/feedback',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      let feedback;


      if (
        req.auth.role ===
        'ADMIN'
      ) {

        feedback =
          await query(
            `
              SELECT *

              FROM feedback

              ORDER BY
                created_at DESC
            `
          );

      }

      else if (
        req.auth.role ===
        'CUSTOMER'
      ) {

        feedback =
          await query(
            `
              SELECT *

              FROM feedback

              WHERE
                customer_id = ?

              ORDER BY
                created_at DESC
            `,
            [
              req.auth.user_id
            ]
          );

      }

      else {

        const manager =
          await getManagerProfile(
            req.auth.user_id
          );


        feedback =
          manager

            ? await query(
                `
                  SELECT *

                  FROM feedback

                  WHERE
                    manager_id = ?

                  ORDER BY
                    created_at DESC
                `,
                [
                  manager.manager_id
                ]
              )

            : [];

      }


      return sendRows(
        res,
        feedback
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load feedback',
        error
      );

    }

  }
);


/*
  Booking feedback
*/

app.get(
  '/api/bookings/:booking_id/feedback',
  requireAuth,
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.params.booking_id
        );


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      const feedback =
        await one(
          `
            SELECT *

            FROM feedback

            WHERE
              booking_id = ?
          `,
          [
            bookingId
          ]
        );


      return res.json(
        feedback
          ? aliases(feedback)
          : null
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load booking feedback',
        error
      );

    }

  }
);


/*
  Submit feedback
*/

app.post(
  '/api/feedback',
  requireAuth,
  requireRole('CUSTOMER'),
  async (
    req,
    res
  ) => {

    try {

      const bookingId =
        int(
          req.body.booking_id ||
          req.body.bookingId
        );


      const rating =
        Number(
          req.body.rating
        );


      const comment =
        text(
          req.body.comment
        );


      if (
        !bookingId ||
        !Number.isInteger(
          rating
        ) ||
        rating < 1 ||
        rating > 5
      ) {

        return res
          .status(400)
          .json({

            message:
              'booking_id and a rating from 1 to 5 are required'

          });

      }


      const access =
        await canAccessBooking(
          bookingId,
          req.auth
        );


      if (!access.allowed) {

        return res
          .status(
            access.status
          )
          .json({
            message:
              'You do not have access to this booking'
          });

      }


      if (
        access.booking.status !==
        'COMPLETED'
      ) {

        return res
          .status(400)
          .json({

            message:
              'Feedback can be submitted after the booking is completed'

          });

      }


      const existing =
        await one(
          `
            SELECT
              feedback_id

            FROM feedback

            WHERE
              booking_id = ?
          `,
          [
            bookingId
          ]
        );


      if (existing) {

        return res
          .status(409)
          .json({
            message:
              'Feedback already submitted'
          });

      }


      const [
        result
      ] =
        await db.execute(
          `
            INSERT INTO feedback
            (
              booking_id,

              customer_id,

              manager_id,

              rating,

              comment
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `,
          [

            bookingId,

            req.auth.user_id,

            access.booking.manager_id,

            rating,

            comment

          ]
        );


      const average =
        await one(
          `
            SELECT

              AVG(rating) AS avg_rating


            FROM feedback


            WHERE
              manager_id = ?
          `,
          [
            access.booking.manager_id
          ]
        );


      await query(
        `
          UPDATE event_manager_profiles

          SET
            rating = ?

          WHERE
            manager_id = ?
        `,
        [

          Number(
            average.avg_rating || 0
          ).toFixed(2),

          access.booking.manager_id

        ]
      );


      return res
        .status(201)
        .json({

          message:
            'Feedback submitted successfully',

          feedback_id:
            result.insertId,

          id:
            result.insertId

        });


    } catch (error) {

      return sendError(
        res,
        'Failed to submit feedback',
        error
      );

    }

  }
);


/* =========================================================
   CUSTOMER DASHBOARD
========================================================= */

app.get(
  '/api/customer/dashboard',
  requireAuth,
  requireRole('CUSTOMER'),
  async (
    req,
    res
  ) => {

    try {

      const dashboard =
        await one(
          `
            SELECT

              u.user_id,

              u.name AS customer_name,


              (

                SELECT
                  COUNT(*)

                FROM event_requirements

                WHERE
                  customer_id =
                  u.user_id

              ) AS total_requirements,


              (

                SELECT
                  COUNT(*)

                FROM proposals p


                JOIN event_requirements er

                  ON
                    p.requirement_id =
                    er.requirement_id


                WHERE
                  er.customer_id =
                  u.user_id

              ) AS total_proposals_received,


              (

                SELECT
                  COUNT(*)

                FROM bookings

                WHERE
                  customer_id =
                  u.user_id

              ) AS total_bookings,


              (

                SELECT
                  COALESCE(
                    SUM(amount),
                    0
                  )

                FROM payments

                WHERE

                  customer_id =
                  u.user_id

                  AND status =
                  'SUCCESS'

              ) AS total_paid


            FROM users u


            WHERE
              u.user_id = ?
          `,
          [
            req.auth.user_id
          ]
        );


      return res.json(
        aliases(
          dashboard || {}
        )
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load customer dashboard',
        error
      );

    }

  }
);


/* =========================================================
   MANAGER DASHBOARD
========================================================= */

app.get('/api/manager/dashboard', requireAuth, requireRole('EVENT_MANAGER'), async (req, res) => {
    try {
      const manager = await getManagerProfile(req.auth.user_id);
      if (!manager) return res.status(404).json({ message: 'Manager profile not found' });

      const dashboard = await one(`
            SELECT emp.manager_id, emp.business_name, emp.rating,
              (SELECT COUNT(*) FROM proposals WHERE manager_id = emp.manager_id) AS my_proposals,
              (SELECT COUNT(*) FROM bookings WHERE manager_id = emp.manager_id) AS my_bookings
            FROM event_manager_profiles emp WHERE emp.user_id = ?`, [req.auth.user_id]);

      const revenueRow = await one(`SELECT SUM(COALESCE(final_amount, estimated_amount, 0)) as pipeline_revenue FROM bookings WHERE manager_id = ? AND status != 'CANCELLED'`, [manager.manager_id]);
      const pendingRow = await one(`SELECT COUNT(*) as pending_proposals FROM proposals WHERE manager_id = ? AND status = 'SUBMITTED'`, [manager.manager_id]);
      
      const openReqs = await query(`SELECT * FROM event_requirements WHERE status IN ('OPEN', 'PROPOSALS_RECEIVED') ORDER BY created_at DESC LIMIT 4`);
      const bookingsList = await query(`SELECT b.*, u.name as customer_name, COALESCE(p.price, b.final_amount) AS final_amount, COALESCE(er.requirement_title, b.event_name) AS event_name FROM bookings b LEFT JOIN users u ON b.customer_id = u.user_id LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id WHERE b.manager_id = ? ORDER BY b.created_at DESC LIMIT 4`, [manager.manager_id]);

      return res.json({
          manager_id: manager.manager_id,
          business_name: manager.business_name,
          rating: manager.rating || '4.95',
          totalRevenue: revenueRow.pipeline_revenue || 0,
          activeBookings: dashboard.my_bookings || 0,
          pendingProposals: pendingRow.pending_proposals || 0,
          openRequirements: openReqs || [],
          bookingsList: bookingsList || []
      });

    } catch (error) {

      return sendError(
        res,
        'Failed to load manager dashboard',
        error
      );

    }

  }
);


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

app.get(
  '/api/dashboard',
  requireAuth,
  requireRole('ADMIN'),
  async (
    req,
    res
  ) => {

    try {

      const dashboard =
        await one(
          `
            SELECT


              (

                SELECT
                  COUNT(*)

                FROM users

              ) AS total_users,


              (

                SELECT
                  COUNT(*)

                FROM events

                WHERE
                  status = 'ACTIVE'

              ) AS total_events,


              (

                SELECT
                  COUNT(*)

                FROM event_manager_profiles

                WHERE
                  status = 'ACTIVE'

              ) AS total_managers,


              (

                SELECT
                  COUNT(*)

                FROM bookings

              ) AS total_bookings,


              (

                SELECT
                  COUNT(*)

                FROM event_requirements

              ) AS total_requirements,


              (

                SELECT
                  COUNT(*)

                FROM proposals

              ) AS total_proposals,


              (

                SELECT
                  COALESCE(
                    SUM(amount),
                    0
                  )

                FROM payments

                WHERE
                  status = 'SUCCESS'

              ) AS total_payments
          `
        );


      return res.json(
        aliases(
          dashboard || {}
        )
      );


    } catch (error) {

      return sendError(
        res,
        'Failed to load admin dashboard',
        error
      );

    }

  }
);


/* =========================================================
   NEWSLETTER
========================================================= */

app.post(
  '/api/newsletter',
  async (
    req,
    res
  ) => {

    try {

      const email =
        text(
          req.body.email,
          ''
        )?.toLowerCase();


      if (
        !validEmail(email)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Enter a valid email address'
          });

      }


      await query(
        `
          INSERT INTO newsletter_subscribers
          (
            email
          )

          VALUES
          (
            ?
          )

          ON DUPLICATE KEY UPDATE
            email = email
        `,
        [
          email
        ]
      );


      return res
        .status(201)
        .json({
          message:
            'Subscribed successfully'
        });


    } catch (error) {

      return sendError(
        res,
        'Newsletter subscription failed',
        error
      );

    }

  }
);


// ==================== RECEIPT PDF ====================
app.get('/api/payments/:id/receipt', requireAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const p = await one('SELECT p.*, pr.price as proposal_price, b.final_amount, b.event_name, b.event_date, b.location, er.requirement_title, u.name as customer_name, m.business_name FROM payments p JOIN bookings b ON p.booking_id = b.booking_id LEFT JOIN proposals pr ON b.proposal_id = pr.proposal_id LEFT JOIN event_requirements er ON pr.requirement_id = er.requirement_id JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id WHERE p.payment_id = ? OR p.transaction_id = ?', [paymentId, paymentId]);
    if (!p) return res.status(404).json({message: 'Payment not found'});
    
    if (Number(p.customer_id) !== Number(req.auth.user_id) && Number(p.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
      return res.status(403).json({message: 'Access denied'});
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="EventFlow_Receipt_${p.transaction_id || p.payment_id}.pdf"`);

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    doc.pipe(res);

    // Color Palette
    const navy = '#0F172A';
    const gold = '#D4AF37';
    const textDark = '#1E293B';
    const textMuted = '#64748B';
    const bgLight = '#F8FAFC';
    const bgGreen = '#F0FDF4';
    const bgLavender = '#F8F7FA';

    // Helper to draw Header
    function drawHeader() {
      doc.fillColor(navy);
      doc.polygon([0, 0], [595, 0], [595, 90], [450, 115], [0, 115]).fill();
      
      // Logo abstract leaf
      doc.lineWidth(2).strokeColor(gold);
      doc.path('M 60 75 Q 45 60 60 45 Q 75 60 60 75 Z').stroke();
      doc.path('M 60 85 L 60 75').stroke();
      doc.path('M 55 60 Q 40 45 50 35 Q 60 50 55 60 Z').stroke();
      doc.path('M 65 60 Q 80 45 70 35 Q 60 50 65 60 Z').stroke();

      doc.fillColor('#FFFFFF').fontSize(28).font('Times-Bold').text('EventFlow', 85, 45);
      doc.fillColor(gold).fontSize(8).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 87, 75, { characterSpacing: 1 });

      doc.moveTo(370, 45).lineTo(370, 85).lineWidth(1).strokeColor('#334155').stroke();

      doc.fillColor('#E2E8F0').fontSize(8).text('EVENT MANAGEMENT', 390, 45, { characterSpacing: 1 })
         .text('MADE SIMPLE', 390, 57, { characterSpacing: 1 })
         .text('FOR A BRIGHTER', 390, 69, { characterSpacing: 1 })
         .text('TOMORROW', 390, 81, { characterSpacing: 1 });
    }

    // Helper to draw Footer
    function drawFooter() {
      const fy = 740;
      doc.fillColor(navy).rect(0, fy, 595, 102).fill();
      
      doc.fillColor(gold).fontSize(20).font('Times-Bold').text('EventFlow', 50, fy + 30);
      doc.fontSize(8).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 52, fy + 55, { characterSpacing: 1 });

      doc.moveTo(300, fy + 35).lineTo(300, fy + 65).lineWidth(1).strokeColor('#334155').stroke();

      doc.fillColor('#E2E8F0').fontSize(8).text('TURNING MOMENTS', 320, fy + 40, { characterSpacing: 1 })
         .text('INTO MEMORIES', 320, fy + 55, { characterSpacing: 1 });
    }

    drawHeader();
    drawFooter();

    // ---------------- BODY ----------------
    let y = 145;
    
    // Title
    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('O F F I C I A L   D O C U M E N T', 50, y, { characterSpacing: 2 });
    y += 15;
    doc.fillColor(navy).fontSize(30).font('Times-Bold').text('Payment Receipt', 50, y);
    y += 35;
    doc.fillColor(textDark).fontSize(14).font('Times-Roman').text('Thank you for your payment!', 50, y);
    y += 20;
    doc.fillColor(textMuted).fontSize(11).font('Helvetica').text('We appreciate your trust in EventFlow.', 50, y);

    // Right Info Box
    doc.roundedRect(380, 140, 165, 75, 4).fill(bgLight);
    const ry = 152;
    doc.fillColor(textMuted).fontSize(9).font('Helvetica');
    doc.text('Receipt No.', 395, ry);
    doc.text('Payment Date', 395, ry + 20);
    doc.text('Transaction ID', 395, ry + 40);

    doc.fillColor(textDark).font('Helvetica-Bold');
    doc.text('EF-REC-' + p.payment_id, 470, ry);
    doc.text(new Date(p.payment_date).toLocaleDateString(), 470, ry + 20);
    doc.text((p.transaction_id || p.payment_id).toString().substring(0, 15), 470, ry + 40);

    // Success Banner
    y = 235;
    doc.roundedRect(50, y, 495, 70, 4).fill(bgGreen);
    // Green Check
    doc.circle(90, y + 35, 18).fill('#16A34A');
    doc.moveTo(82, y + 35).lineTo(88, y + 41).lineTo(98, y + 28).lineWidth(3).strokeColor('#FFFFFF').stroke();
    
    doc.fillColor(navy).fontSize(16).font('Times-Bold').text('Payment Successful!', 125, y + 20);
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text('Your payment has been received and processed successfully.', 125, y + 42);

    doc.moveTo(390, y + 15).lineTo(390, y + 55).lineWidth(1).strokeColor('#BBF7D0').stroke();
    doc.fillColor(navy).fontSize(10).font('Times-Roman').text('Together', 410, y + 18)
       .text('We Create', 410, y + 32)
       .text('Memories', 410, y + 46);
    doc.moveTo(410, y + 60).lineTo(460, y + 60).lineWidth(1).strokeColor(gold).stroke();

    // Details Box
    y = 325;
    doc.roundedRect(50, y, 310, 240, 6).fill(bgLight);
    
    // Icon & Header
    doc.rect(65, y + 15, 16, 16).fill('#CBD5E1'); // tiny icon placeholder
    doc.moveTo(68, y + 19).lineTo(78, y + 19).lineWidth(1).strokeColor(navy).stroke();
    doc.moveTo(68, y + 23).lineTo(78, y + 23).stroke();
    doc.moveTo(68, y + 27).lineTo(74, y + 27).stroke();
    
    doc.fillColor(navy).fontSize(13).font('Times-Bold').text('Payment Details', 90, y + 16);
    
    doc.moveTo(65, y + 40).lineTo(340, y + 40).lineWidth(1).strokeColor('#E2E8F0').stroke();

    const dLabels = ['Customer Name', 'Booking ID', 'Event Name', 'Event Date', 'Event Venue', 'Payment Method', 'Amount Paid', 'Payment Status'];
    const dVals = [
      p.customer_name || 'Customer',
      'BK-' + p.booking_id,
      (p.requirement_title || p.event_name || 'Event').substring(0, 25),
      new Date(p.event_date).toLocaleDateString(),
      (p.location || 'TBD').substring(0, 25),
      p.payment_method || 'UPI',
      'INR ' + Number(p.amount).toLocaleString('en-IN', {minimumFractionDigits:2}),
      'Successful'
    ];

    let rowY = y + 55;
    for(let i = 0; i < dLabels.length; i++) {
      doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text(dLabels[i], 65, rowY);
      doc.text(':', 160, rowY);
      if (dLabels[i] === 'Payment Status') {
        // Pill badge
        doc.roundedRect(175, rowY - 3, 75, 18, 9).fill('#16A34A');
        doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text('?  Successful', 183, rowY + 1);
      } else {
        doc.fillColor(textDark).fontSize(10).font('Helvetica').text(dVals[i], 175, rowY);
      }
      rowY += 22;
    }

    // Quote Box
    doc.roundedRect(380, y, 165, 240, 6).fill(bgLavender);
    doc.fillColor(gold).fontSize(40).font('Times-Bold').text('“', 395, y + 10);
    doc.fillColor(navy).fontSize(18).font('Times-Bold').text('Every', 395, y + 50)
       .text('Celebration', 395, y + 75)
       .text('Tells a Story', 395, y + 100);
    
    doc.fillColor(textMuted).fontSize(10).font('Times-Roman').text('Thank you for', 395, y + 140)
       .text('being a part of', 395, y + 155)
       .text('our journey.', 395, y + 170);

    // Decorative lines in quote box
    doc.path('M 480 200 Q 520 180 540 230 Q 500 240 480 200 Z').lineWidth(1).strokeColor('#E2E8F0').stroke();
    doc.path('M 490 240 Q 530 200 545 280 Q 480 270 490 240 Z').stroke();

    // Footer contact area
    y = 600;
    doc.fillColor(navy).fontSize(34).font('Times-Italic').text('Thank You!', 50, y);
    doc.fontSize(12).font('Helvetica-Bold').text('Team EventFlow', 50, y + 45);
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text('For trusting us to be part of your special moments.', 50, y + 60);

    // Fake QR
    doc.rect(260, y + 10, 50, 50).lineWidth(1).strokeColor(navy).stroke();
    doc.rect(264, y + 14, 15, 15).fill(navy); doc.rect(268, y + 18, 7, 7).fill('#FFF'); doc.rect(270, y + 20, 3, 3).fill(navy);
    doc.rect(291, y + 14, 15, 15).fill(navy);
    doc.rect(264, y + 41, 15, 15).fill(navy);
    doc.rect(285, y + 35, 21, 21).fill(navy);
    doc.rect(287, y + 37, 17, 17).fill('#FFF');
    doc.rect(290, y + 40, 4, 4).fill(navy); doc.rect(296, y + 46, 6, 6).fill(navy);
    
    doc.fillColor(navy).fontSize(8).font('Helvetica-Bold').text('Scan to visit', 255, y + 70, {width: 60, align: 'center'})
       .text('our website', 255, y + 80, {width: 60, align: 'center'});

    // Contact lines
    const cx = 350;
    doc.circle(cx + 8, y + 16, 6).lineWidth(1).strokeColor(navy).stroke(); // phone icon
    doc.fillColor(textDark).fontSize(10).font('Helvetica').text('+91 98765 43210', cx + 25, y + 12);

    doc.rect(cx + 2, y + 33, 12, 8).stroke(); // mail icon
    doc.moveTo(cx + 2, y + 33).lineTo(cx + 8, y + 37).lineTo(cx + 14, y + 33).stroke();
    doc.text('support@eventflow.com', cx + 25, y + 32);

    doc.circle(cx + 8, y + 56, 6).stroke(); // globe icon
    doc.moveTo(cx + 2, y + 56).lineTo(cx + 14, y + 56).stroke();
    doc.text('www.eventflow.com', cx + 25, y + 52);

    doc.end();
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
});


// ==================== STATEMENT PDF ====================
app.get('/api/bookings/:id/statement', requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const b = await one(`SELECT b.*, p.price as proposal_price, u.name as customer_name, m.business_name, er.requirement_title FROM bookings b JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id LEFT JOIN proposals p
        ON
          b.proposal_id =
          p.proposal_id

      LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id WHERE b.booking_id = ?`, [bookingId]);
    if (!b) return res.status(404).json({message: 'Booking not found'});
    
    if (Number(b.customer_id) !== Number(req.auth.user_id) && Number(b.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
      return res.status(403).json({message: 'Access denied'});
    }
    
    const payments = await query('SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date ASC', [bookingId]);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="EventFlow_Statement_BK${b.booking_id}.pdf"`);
    
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    doc.pipe(res);

    // Color Palette
    const navy = '#0F172A';
    const gold = '#D4AF37';
    const textDark = '#1E293B';
    const textMuted = '#64748B';
    const bgLight = '#F8FAFC';
    
    // Helpers
    function drawHeader() {
      doc.fillColor(navy).polygon([0, 0], [595, 0], [595, 90], [450, 115], [0, 115]).fill();
      doc.lineWidth(2).strokeColor(gold);
      doc.path('M 60 75 Q 45 60 60 45 Q 75 60 60 75 Z').stroke();
      doc.path('M 60 85 L 60 75').stroke();
      doc.path('M 55 60 Q 40 45 50 35 Q 60 50 55 60 Z').stroke();
      doc.path('M 65 60 Q 80 45 70 35 Q 60 50 65 60 Z').stroke();

      doc.fillColor('#FFFFFF').fontSize(28).font('Times-Bold').text('EventFlow', 85, 45);
      doc.fillColor(gold).fontSize(8).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 87, 75, { characterSpacing: 1 });

      doc.moveTo(370, 45).lineTo(370, 85).lineWidth(1).strokeColor('#334155').stroke();

      doc.fillColor('#E2E8F0').fontSize(8).text('YOUR EVENTS', 390, 45, { characterSpacing: 1 })
         .text('OUR COMMITMENT', 390, 57, { characterSpacing: 1 })
         .text('A HAPPIER TOMORROW', 390, 69, { characterSpacing: 1 });
      doc.moveTo(390, 83).lineTo(440, 83).lineWidth(2).strokeColor(gold).stroke();
    }

    function drawFooter() {
      const fy = 780; // slightly lower for statement to give space
      doc.fillColor(navy).rect(0, fy, 595, 62).fill();
      
      doc.fillColor(gold).fontSize(16).font('Times-Bold').text('EventFlow', 40, fy + 20);
      doc.fontSize(7).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 42, fy + 40, { characterSpacing: 1 });
      doc.moveTo(210, fy + 25).lineTo(210, fy + 45).lineWidth(1).strokeColor('#334155').stroke();
      doc.fillColor('#E2E8F0').fontSize(8).text('MEMORIES', 460, fy + 25, { characterSpacing: 1, align:'right', width:100 })
         .text('FOR A LIFETIME', 460, fy + 37, { characterSpacing: 1, align:'right', width:100 });
    }

    drawHeader();
    
    // ---------------- BODY ----------------
    let y = 135;
    
    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('O F F I C I A L   D O C U M E N T', 50, y, { characterSpacing: 2 });
    y += 15;
    doc.fillColor(navy).fontSize(30).font('Times-Bold').text('Payment Statement', 50, y);
    y += 35;
    doc.fillColor(textDark).fontSize(14).font('Times-Roman').text('A complete overview of your payments', 50, y);

    // Right Info Box
    doc.roundedRect(400, 130, 145, 60, 4).fill(bgLight);
    doc.fillColor(textMuted).fontSize(9).font('Helvetica');
    doc.text('Statement No.', 410, 142);
    doc.text('Statement Date', 410, 162);
    doc.fillColor(textDark).font('Helvetica-Bold');
    doc.text('EF-STMT-' + b.booking_id, 485, 142);
    doc.text(new Date().toLocaleDateString(), 485, 162);

    // Booking Info & Image
    y = 210;
    doc.roundedRect(40, y, 320, 130, 6).fill(bgLight);
    
    // Icon
    doc.rect(55, y + 15, 14, 14).fill('#CBD5E1'); 
    doc.fillColor(navy).fontSize(12).font('Times-Bold').text('Booking Information', 75, y + 16);
    doc.moveTo(55, y + 36).lineTo(345, y + 36).lineWidth(1).strokeColor('#E2E8F0').stroke();

    const blabels = ['Customer Name', 'Booking ID', 'Event Name', 'Event Date', 'Event Venue', 'Event Manager'];
    const bvals = [
      b.customer_name || 'Customer',
      'BK-' + b.booking_id,
      (b.requirement_title || b.event_name || 'Event').substring(0,25),
      new Date(b.event_date).toLocaleDateString(),
      (b.location || 'TBD').substring(0, 25),
      b.business_name || 'Manager'
    ];
    let rowY = y + 45;
    for(let i=0; i<blabels.length; i++) {
      doc.fillColor(textMuted).fontSize(9).font('Helvetica-Bold').text(blabels[i], 55, rowY);
      doc.text(':', 140, rowY);
      doc.fillColor(textDark).font('Helvetica').text(bvals[i], 150, rowY);
      rowY += 14;
    }

    // Right Image Placeholder
    doc.roundedRect(370, y, 175, 130, 6).fill(navy);
    doc.fillColor('#E2E8F0').fontSize(16).font('Times-Bold').text('MOMENTS', 370, y + 45, {align: 'center', width: 175});
    doc.fillColor(gold).fontSize(8).font('Helvetica-Bold').text('SPECIAL EVENTS', 370, y + 100, {align: 'center', width: 175});
    doc.fillColor('#E2E8F0').text('BRIGHTER PEOPLE', 370, y + 112, {align: 'center', width: 175});

    // Payment Summary
    y = 355;
    doc.roundedRect(40, y, 505, 120, 6).fill('#FFFDF5'); // Light gold
    
    doc.rect(55, y + 15, 14, 14).fill('#E5E7EB');
    doc.fillColor(navy).fontSize(12).font('Times-Bold').text('Payment Summary', 75, y + 16);
    doc.moveTo(55, y + 36).lineTo(525, y + 36).lineWidth(1).strokeColor('#FEF08A').stroke();

    const finalAmt = Number((typeof p !== 'undefined' ? p.proposal_price || p.final_amount : 0) || (typeof b !== 'undefined' ? b.proposal_price || b.final_amount : 0)) || 0;
    const totalPaid = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((acc, p) => acc + Number(p.amount), 0);
    const remaining = Math.max(finalAmt - totalPaid, 0);
    const pct = finalAmt > 0 ? Math.round((totalPaid / finalAmt) * 100) : 0;
    
    let isFullyPaid = (remaining === 0 && finalAmt > 0);
    let overallStatus = isFullyPaid ? 'Fully Paid' : (totalPaid > 0 ? 'Partially Paid' : 'Unpaid');

    const sLabels = ['Total Contract Value', 'Total Amount Paid', 'Remaining Amount', 'Current Milestone', 'Overall Payment Status'];
    const sVals = [
      'INR ' + finalAmt.toLocaleString('en-IN', {minimumFractionDigits:2}),
      'INR ' + totalPaid.toLocaleString('en-IN', {minimumFractionDigits:2}),
      'INR ' + remaining.toLocaleString('en-IN', {minimumFractionDigits:2}),
      isFullyPaid ? 'Completed' : (totalPaid > 0 ? 'Stage 2 (40%)' : 'Stage 1 (60%)'),
      overallStatus
    ];

    rowY = y + 45;
    for(let i=0; i<sLabels.length; i++) {
      doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text(sLabels[i], 55, rowY);
      doc.text(':', 200, rowY);
      if (sLabels[i] === 'Overall Payment Status') {
        doc.roundedRect(215, rowY - 3, 85, 18, 9).fill(isFullyPaid ? '#16A34A' : '#FEF08A');
        doc.fillColor(isFullyPaid ? '#FFFFFF' : '#854D0E').fontSize(10).font('Helvetica-Bold').text(sVals[i], 215, rowY + 1, {width: 85, align: 'center'});
      } else {
        doc.fillColor(textDark).font('Helvetica').text(sVals[i], 215, rowY);
      }
      rowY += 15;
    }

    // Donut chart
    doc.circle(460, y + 65, 35).lineWidth(8).strokeColor('#E2E8F0').stroke();
    if (pct > 0) {
      const startAngle = -90;
      const endAngle = startAngle + (360 * (pct / 100));
      // path workaround for arcs since .arc is tricky: using simple path or just leave text
      // pdfkit path can draw arcs, but let's just use text in the center
    }
    // we'll just put the text inside a solid circle to mimic the design safely
    doc.circle(460, y + 65, 35).lineWidth(6).strokeColor(isFullyPaid ? '#16A34A' : navy).stroke();
    doc.fillColor(navy).fontSize(16).font('Times-Bold').text(pct + '%', 440, y + 55, {width: 40, align: 'center'});
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text('Paid', 440, y + 72, {width: 40, align: 'center'});

    // Ledger Table
    y = 490;
    doc.roundedRect(40, y, 505, 35, 6).fill(bgLight);
    doc.rect(55, y + 10, 14, 14).fill('#CBD5E1'); 
    doc.fillColor(navy).fontSize(12).font('Times-Bold').text('Transaction Ledger', 75, y + 11);
    
    y += 45;
    doc.rect(40, y, 505, 25).fill('#F1F5F9');
    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold');
    doc.text('#', 50, y + 8);
    doc.text('Transaction ID', 70, y + 8);
    doc.text('Payment Date', 160, y + 8);
    doc.text('Milestone', 240, y + 8);
    doc.text('Payment Method', 310, y + 8);
    doc.text('Amount', 400, y + 8);
    doc.text('Status', 480, y + 8);

    y += 25;
    
    // Rows
    const stage1Amt = finalAmt * 0.60;
    const stage2Amt = finalAmt * 0.40;
    
    // Simulate Stage 1 and Stage 2 based on payments
    let stages = [
      { id: 1, name: 'Stage 1 (60%)', amount: stage1Amt, p: payments[0] },
      { id: 2, name: 'Stage 2 (40%)', amount: stage2Amt, p: payments[1] }
    ];

    stages.forEach((stg) => {
      doc.rect(40, y, 505, 30).fill('#FFFFFF');
      doc.moveTo(40, y+30).lineTo(545, y+30).lineWidth(1).strokeColor('#F1F5F9').stroke();
      
      doc.fillColor(textDark).fontSize(9).font('Helvetica');
      doc.text(stg.id.toString(), 50, y + 10);
      
      if (stg.p && (stg.p.status === 'SUCCESS' || stg.p.status === 'COMPLETED')) {
        doc.text((stg.p.transaction_id || stg.p.payment_id).toString().substring(0, 15), 70, y + 10);
        doc.text(new Date(stg.p.payment_date).toLocaleDateString(), 160, y + 10);
        doc.text(stg.name, 240, y + 10);
        doc.text(stg.p.payment_method || 'UPI', 310, y + 10);
        doc.text('INR ' + Number(stg.p.amount).toLocaleString('en-IN'), 400, y + 10);
        
        doc.roundedRect(475, y + 6, 60, 16, 8).fill('#16A34A');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('? Paid', 475, y + 10, {width: 60, align: 'center'});
      } else {
        doc.text('-', 70, y + 10);
        doc.text('-', 160, y + 10);
        doc.text(stg.name, 240, y + 10);
        doc.text('-', 310, y + 10);
        doc.text('INR ' + Number(stg.amount).toLocaleString('en-IN'), 400, y + 10);
        
        doc.roundedRect(475, y + 6, 60, 16, 8).fill('#FEF08A');
        doc.fillColor('#854D0E').fontSize(8).font('Helvetica-Bold').text('Pending', 475, y + 10, {width: 60, align: 'center'});
      }
      y += 30;
    });

    // Notes Box & Totals
    y += 15;
    doc.roundedRect(40, y, 320, 60, 4).fill(bgLight);
    doc.fillColor(navy).fontSize(9).font('Helvetica-Bold').text('Note:', 50, y + 10);
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('1. This statement includes all successful payments made for this booking.', 50, y + 25);
    doc.text('2. Refunds, if any, will be shown separately.', 50, y + 35);
    doc.text('3. For any queries, contact our support team.', 50, y + 45);

    doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text('Total Paid', 390, y + 15);
    doc.text('Total Remaining', 390, y + 30);
    doc.text('Refunds (if any)', 390, y + 45);
    
    doc.fillColor(navy).font('Helvetica-Bold');
    doc.text(':   INR ' + totalPaid.toLocaleString('en-IN', {minimumFractionDigits: 2}), 470, y + 15);
    doc.text(':   INR ' + remaining.toLocaleString('en-IN', {minimumFractionDigits: 2}), 470, y + 30);
    doc.text(':   INR 0.00', 470, y + 45);

    drawFooter();
    
    doc.end();
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
});



// ==========================================
// NOTIFICATIONS API
// ==========================================

app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
        const notifs = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.auth.user_id]);
        return res.json(notifs || []);
    } catch (e) {
        return sendError(res, 'Failed to fetch notifications', e);
    }
});

app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
        await query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.auth.user_id]);
        return res.json({ success: true });
    } catch (e) {
        return sendError(res, 'Failed to mark read', e);
    }
});



/* =========================================================
   API 404
========================================================= */

app.use(
  '/api',
  (
    req,
    res
  ) => {

    res
      .status(404)
      .json({

        message:
          `API route not found: ${req.method} ${req.originalUrl}`

      });

  }
);


/* =========================================================
   GENERAL ERROR
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      '[EventFlow] Unhandled error',
      error
    );


    if (
      res.headersSent
    ) {

      return next(error);

    }


    return res
      .status(500)
      .json({
        message:
          'Unexpected server error'
      });

  }
);


/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

  try {

    await query(
      'SELECT 1 AS ok'
    );


    console.log(
      'MySQL connected successfully!'
    );


  } catch (error) {

    console.error(
      'MySQL connection failed:',
      error.message
    );


    console.error(
      'Check Backend/.env values:'
    );

    console.error(
      'DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT'
    );

  }


  
app.listen(
    PORT,
    () => {

      console.log(
        `EventFlow server running on http://localhost:${PORT}`
      );


      console.log(
        `Frontend served from ${FRONTEND_DIR}`
      );

    }
  );

}


startServer();


module.exports = app;

